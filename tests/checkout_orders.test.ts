import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../src/lib/prisma';

describe('Checkout, COD Order, Razorpay Order, 10 Consecutive Orders & Order Isolation', () => {
  let user1Token = '';
  let user1Id = '';
  let user1Email = '';

  let user2Token = '';
  let user2Id = '';

  let testProduct: any = null;

  it('Setup: Register User 1 and User 2 and fetch test product', async () => {
    user1Email = `orderuser1_${Date.now()}@example.com`;
    const reg1 = await request(app)
      .post('/api/auth/register')
      .send({
        email: user1Email,
        password: 'Password123!',
        name: 'Order User 1'
      });
    expect(reg1.status).toBe(201);
    user1Token = reg1.body.token;
    user1Id = reg1.body.user.id;

    const reg2 = await request(app)
      .post('/api/auth/register')
      .send({
        email: `orderuser2_${Date.now()}@example.com`,
        password: 'Password123!',
        name: 'Order User 2'
      });
    expect(reg2.status).toBe(201);
    user2Token = reg2.body.token;
    user2Id = reg2.body.user.id;

    const prodRes = await request(app).get('/api/products');
    expect(prodRes.body.length).toBeGreaterThan(0);
    testProduct = prodRes.body[0];
  });

  it('6. COD Order: Should place COD order and immediately update order status', async () => {
    // Add item to cart first
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ productId: testProduct.id, quantity: 1 });

    const res = await request(app)
      .post('/api/checkout')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        paymentMethod: 'COD',
        shippingAddress: {
          street: '100 COD Industrial Highway',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          country: 'India'
        }
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.order).toBeDefined();
    expect(res.body.order.paymentStatus).toBe('COD');
    expect(['PROCESSING', 'PENDING', 'CONFIRMED']).toContain(res.body.order.status);

    // DB Verification
    const dbOrder = await prisma.order.findUnique({ where: { id: res.body.order.id } });
    expect(dbOrder).not.toBeNull();
    expect(dbOrder?.paymentStatus).toBe('COD');
  });

  it('7. Razorpay Order: Should initiate Razorpay payment and verify payment', async () => {
    // Add item to cart first
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ productId: testProduct.id, quantity: 1 });

    // 1. Create Checkout Order
    const checkoutRes = await request(app)
      .post('/api/checkout')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        paymentMethod: 'RAZORPAY',
        shippingAddress: {
          street: '200 Razorpay Tech Park',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
          country: 'India'
        }
      });

    expect([200, 201]).toContain(checkoutRes.status);
    const orderId = checkoutRes.body.order.id;

    // 2. Verify Razorpay Payment endpoint
    const verifyRes = await request(app)
      .post('/api/payments/razorpay/verify')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        orderId,
        razorpay_order_id: 'rzp_test_order_12345',
        razorpay_payment_id: 'pay_test_payment_67890',
        razorpay_signature: 'sig_test_1234567890'
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);

    // DB Verification that order is PAID and CONFIRMED
    const dbOrder = await prisma.order.findUnique({ where: { id: orderId } });
    expect(dbOrder?.paymentStatus).toBe('PAID');
    expect(dbOrder?.status).toBe('CONFIRMED');
    expect(dbOrder?.razorpayPaymentId).toBe('pay_test_payment_67890');
  });

  it('8. Multiple Orders: Should create 10 consecutive orders and ensure ALL 10 are returned for User 1', async () => {
    // We already created 2 orders above for User 1. Let's create 8 more to reach 10 total orders for User 1.
    for (let i = 3; i <= 10; i++) {
      // Add item to cart for each checkout
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ productId: testProduct.id, quantity: 1 });

      const res = await request(app)
        .post('/api/checkout')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          paymentMethod: 'COD',
          shippingAddress: {
            street: `Batch Street #${i}`,
            city: 'Delhi',
            state: 'Delhi',
            postalCode: '110001',
            country: 'India'
          }
        });
      expect([200, 201]).toContain(res.status);
    }

    // Fetch user 1 orders
    const getRes = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(getRes.status).toBe(200);
    expect(Array.isArray(getRes.body)).toBe(true);

    // CRITICAL REGRESSION CHECK: Must return ALL 10 orders (NOT 1 order!)
    expect(getRes.body.length).toBe(10);
    expect(getRes.body.length).not.toBe(1);

    // Verify DB count directly matches API response length
    const dbUser1Orders = await prisma.order.findMany({ where: { userId: user1Id } });
    expect(dbUser1Orders.length).toBe(10);
    expect(getRes.body.length).toBe(dbUser1Orders.length);
  });

  it('Security: Customer 2 MUST NOT access Customer 1 orders', async () => {
    // Fetch orders as User 2
    const user2OrdersRes = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${user2Token}`);

    expect(user2OrdersRes.status).toBe(200);
    // User 2 has placed 0 orders, so should receive 0 orders
    expect(user2OrdersRes.body.length).toBe(0);

    // Attempt to access User 1's specific order by ID as User 2
    const user1Orders = await prisma.order.findMany({ where: { userId: user1Id } });
    expect(user1Orders.length).toBeGreaterThan(0);
    const user1OrderId = user1Orders[0].id;

    const directAccessRes = await request(app)
      .get(`/api/orders/${user1OrderId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    // Should deny access with 403 or return empty/error
    expect([403, 404]).toContain(directAccessRes.status);
  });
});
