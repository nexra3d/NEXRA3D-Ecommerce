import { describe, it, expect } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app';
import { prisma } from '../src/lib/prisma';

describe('Custom Orders & Razorpay Dynamic QR REST API', () => {
  let adminToken = '';
  let createdOrderId = '';

  it('Setup: Create & authenticate as Admin user', async () => {
    const adminEmail = `admin_${Date.now()}@example.com`;
    const passwordHash = await bcrypt.hash('admin123', 10);

    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Custom Order Admin',
        password: passwordHash,
        role: 'ADMIN'
      }
    });

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

  it('1. GET /api/admin/custom-orders returns list of custom orders', async () => {
    const res = await request(app)
      .get('/api/admin/custom-orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('2. POST /api/admin/custom-orders creates a custom order with dynamic QR and UPI link', async () => {
    const res = await request(app)
      .post('/api/admin/custom-orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customerName: 'Aarav Gupta',
        phone: '9876543210',
        email: 'aarav.gupta@example.com',
        description: '3D Printed Mechanical Gear Prototype',
        amount: 850,
        deliveryType: 'STORE_PICKUP',
        notes: '0.12mm layer height, PETG Black'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('customOrder');
    const order = res.body.customOrder;
    expect(order.customerName).toBe('Aarav Gupta');
    expect(order.amount).toBe(850);
    expect(order.paymentStatus).toBe('AWAITING_PAYMENT');
    expect(order).toHaveProperty('qrImageUrl');
    expect(order).toHaveProperty('paymentLink');
    expect(order.qrImageUrl).toContain('data:image/png;base64,');
    expect(order.id).toMatch(/^N3D-CO-\d{4}-\d{8}$/);
    createdOrderId = order.id;
  });

  it('3. GET /api/admin/custom-orders/:id retrieves the created custom order', async () => {
    const res = await request(app)
      .get(`/api/admin/custom-orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdOrderId);
    expect(res.body.customerName).toBe('Aarav Gupta');
  });

  it('4. POST /api/admin/custom-orders/:id/verify-status checks payment state', async () => {
    const res = await request(app)
      .post(`/api/admin/custom-orders/${createdOrderId}/verify-status`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('customOrder');
  });

  it('5. POST /api/admin/custom-orders/:id/mark-paid marks order as paid', async () => {
    const res = await request(app)
      .post(`/api/admin/custom-orders/${createdOrderId}/mark-paid`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.customOrder.paymentStatus).toBe('PAID');
    expect(res.body.customOrder.paidAt).not.toBeNull();
  });

  it('6. POST /api/admin/custom-orders/:id/cancel cancels an order', async () => {
    const createRes = await request(app)
      .post('/api/admin/custom-orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customerName: 'Rohan Mehta',
        phone: '9123456780',
        amount: 500,
        deliveryType: 'STORE_PICKUP'
      });

    const newOrderId = createRes.body.customOrder.id;

    const cancelRes = await request(app)
      .post(`/api/admin/custom-orders/${newOrderId}/cancel`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.customOrder.paymentStatus).toBe('CANCELLED');
  });
});
