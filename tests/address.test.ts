import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../src/lib/prisma';

describe('4. Address CRUD & Checkout Address Selection Priority', () => {
  let userToken = '';
  let userId = '';
  let address1Id = '';
  let address2Id = '';

  it('Setup: Create user for address testing', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `addruser_${Date.now()}@example.com`,
        password: 'Password123!',
        name: 'Address Test User'
      });
    expect(regRes.status).toBe(201);
    userToken = regRes.body.token;
    userId = regRes.body.user.id;
  });

  it('4. Address CRUD: Should create primary address', async () => {
    const res = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        fullName: 'Address Test User',
        streetAddress: '123 Primary Industrial Park',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
        isDefault: true
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('id');
    address1Id = res.body.id;

    // Verify DB state
    const dbAddr = await prisma.address.findUnique({ where: { id: address1Id } });
    expect(dbAddr).not.toBeNull();
    expect(dbAddr?.streetAddress).toBe('123 Primary Industrial Park');
    expect(dbAddr?.isDefault).toBe(true);
  });

  it('4. Address CRUD: Should create secondary non-default address', async () => {
    const res = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        fullName: 'Address Secondary User',
        streetAddress: '456 Secondary Warehouse Road',
        city: 'Pune',
        state: 'Maharashtra',
        postalCode: '411001',
        country: 'India',
        isDefault: false
      });

    expect([200, 201]).toContain(res.status);
    address2Id = res.body.id;

    const addressesRes = await request(app)
      .get('/api/addresses')
      .set('Authorization', `Bearer ${userToken}`);

    expect(addressesRes.status).toBe(200);
    expect(addressesRes.body.length).toBe(2);
  });

  it('4. Address CRUD: Should update an existing address', async () => {
    const res = await request(app)
      .put(`/api/addresses/${address2Id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        fullName: 'Address Secondary Updated',
        streetAddress: '456 Updated Warehouse Road Extension',
        city: 'Pune',
        state: 'Maharashtra',
        postalCode: '411001',
        country: 'India'
      });

    expect(res.status).toBe(200);
    const dbAddr = await prisma.address.findUnique({ where: { id: address2Id } });
    expect(dbAddr?.streetAddress).toBe('456 Updated Warehouse Road Extension');
  });

  it('7. Checkout Address Priority: Should prioritize explicit custom/selected address over default address', async () => {
    // Get product to checkout
    const prodRes = await request(app).get('/api/products');
    const product = prodRes.body[0];

    // Add product to cart
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId: product.id, quantity: 1 });

    const customAddressObj = {
      fullName: 'Priority Address User',
      streetAddress: '789 Custom Selected Site Address',
      city: 'Nagpur',
      state: 'Maharashtra',
      postalCode: '440001',
      country: 'India'
    };

    const checkoutRes = await request(app)
      .post('/api/checkout')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        paymentMethod: 'COD',
        shippingAddress: customAddressObj
      });

    expect([200, 201]).toContain(checkoutRes.status);
    expect(checkoutRes.body.order).toBeDefined();

    // Verify order in DB uses customAddressObj, NOT the default address (address1Id)
    const orderId = checkoutRes.body.order.id;
    const dbOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { shippingAddress: true }
    });

    expect(dbOrder?.shippingAddress?.streetAddress).toBe('789 Custom Selected Site Address');
  });
});
