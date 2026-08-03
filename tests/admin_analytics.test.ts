import { describe, it, expect } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app';
import { prisma } from '../src/lib/prisma';

describe('10. Admin Orders, 11. Dashboard Analytics & 12. Shipments', () => {
  let adminToken = '';
  let adminUserId = '';

  it('Setup: Login as Admin user', async () => {
    const adminEmail = `admin_${Date.now()}@example.com`;
    const passwordHash = await bcrypt.hash('admin123', 10);

    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'System Test Admin',
        password: passwordHash,
        role: 'ADMIN'
      }
    });
    adminUserId = adminUser.id;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: adminEmail,
        password: 'admin123'
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
    adminToken = loginRes.body.token;
  });

  it('10. Admin Orders: Admin MUST see ALL orders across all customers in system', async () => {
    const adminOrdersRes = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminOrdersRes.status).toBe(200);
    expect(Array.isArray(adminOrdersRes.body)).toBe(true);

    // Verify against DB count
    const totalOrdersInDb = await prisma.order.count();
    expect(adminOrdersRes.body.length).toBe(totalOrdersInDb);
  });

  it('11. Dashboard Analytics: Analytics counters MUST strictly match database values', async () => {
    const analyticsRes = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(analyticsRes.status).toBe(200);

    const dbTotalOrders = await prisma.order.count();
    const dbTotalProducts = await prisma.product.count();
    const dbTotalUsers = await prisma.user.count();

    expect(analyticsRes.body.totalOrders).toBe(dbTotalOrders);
    expect(analyticsRes.body.totalProducts).toBe(dbTotalProducts);
    expect(analyticsRes.body.totalCustomers).toBe(dbTotalUsers);

    // Verify revenue calculation
    const dbOrders = await prisma.order.findMany();
    const calculatedRevenue = dbOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    expect(analyticsRes.body.totalRevenue).toBe(calculatedRevenue);
  });

  it('12. Shipments: Should create shipment for order and track shipment status', async () => {
    // Check if an order exists, or create a quick test order
    let targetOrder = await prisma.order.findFirst();
    if (!targetOrder) {
      targetOrder = await prisma.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}`,
          userId: adminUserId,
          status: 'PROCESSING',
          paymentStatus: 'PAID',
          totalAmount: 1000
        }
      });
    }

    expect(targetOrder).not.toBeNull();

    // Create shipment via admin order shipments endpoint
    const shipRes = await request(app)
      .post(`/api/admin/orders/${targetOrder.id}/shipments`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        provider: 'Delhivery',
        awbNumber: 'AWB987654321',
        estimatedDelivery: new Date().toISOString()
      });

    expect([200, 201]).toContain(shipRes.status);
    expect(shipRes.body).toHaveProperty('awbNumber', 'AWB987654321');

    // Verify shipment label endpoint
    const labelRes = await request(app)
      .get(`/api/shipments/${shipRes.body.id}/label`);

    expect(labelRes.status).toBe(200);
    expect(labelRes.body).toHaveProperty('shipmentId', shipRes.body.id);
  });
});
