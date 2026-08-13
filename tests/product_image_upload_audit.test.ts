import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../src/lib/prisma';
import { isLithophaneProduct } from '../src/lib/personalization';

describe('NEXRA 3D — Product Image Upload Flag & Schema Audit', () => {
  let adminToken = '';
  let customerToken = '';
  let tableLampId = 'prod-spiral-ambient-lamp';
  let lithophaneLampId = 'prod-lithophane-moon-lamp';
  let testCategoryId = 'cat-lamps';

  beforeAll(async () => {
    // 1. Register admin user
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin Auditor',
        email: `admin_auditor_${Date.now()}@nexra3d.in`,
        password: 'AdminPassword123!'
      });
    adminToken = adminRes.body.token;

    // 2. Register customer user
    const custRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Customer Test',
        email: `customer_auditor_${Date.now()}@example.com`,
        password: 'CustPassword123!'
      });
    customerToken = custRes.body.token;
  });

  describe('Step 8 & 1: Product API Response & Frontend Boolean Flags', () => {
    it('Normal Table Lamp must have requiresImageUpload === false and requiresCustomization === false', async () => {
      const res = await request(app).get(`/api/products/${tableLampId}`);
      expect(res.status).toBe(200);
      expect(res.body.requiresImageUpload).toBe(false);
      expect(res.body.requiresCustomization).toBe(false);

      // Verify personalization helper
      expect(isLithophaneProduct(res.body)).toBe(false);
      // Verify boolean display condition
      const shouldDisplayUploadUI = Boolean(res.body && res.body.requiresImageUpload === true);
      expect(shouldDisplayUploadUI).toBe(false);
    });

    it('Lithophane Lamp must have requiresImageUpload === true, min 1, max 5', async () => {
      const res = await request(app).get(`/api/products/${lithophaneLampId}`);
      expect(res.status).toBe(200);
      expect(res.body.requiresImageUpload).toBe(true);
      expect(res.body.minimumImageUploads).toBe(1);
      expect(res.body.maximumImageUploads).toBe(5);

      // Verify personalization helper
      expect(isLithophaneProduct(res.body)).toBe(true);
      // Verify boolean display condition
      const shouldDisplayUploadUI = Boolean(res.body && res.body.requiresImageUpload === true);
      expect(shouldDisplayUploadUI).toBe(true);
    });
  });

  describe('Step 9: Upload Endpoint Verification & Limit Enforcement', () => {
    it('Must reject photo uploads for normal Table Lamp (requiresImageUpload = false)', async () => {
      const buffer = Buffer.from('fake image content');
      const res = await request(app)
        .post('/api/customization/upload')
        .set('Authorization', `Bearer ${customerToken}`)
        .field('productId', tableLampId)
        .attach('images', buffer, 'test.jpg');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/does not support or require photo uploads/i);
    });

    it('Accepts 1 photo upload for Lithophane Lamp', async () => {
      const buffer = Buffer.from('fake image 1');
      const res = await request(app)
        .post('/api/customization/upload')
        .set('Authorization', `Bearer ${customerToken}`)
        .field('productId', lithophaneLampId)
        .field('currentCount', '0')
        .attach('images', buffer, 'photo1.jpg');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.images.length).toBe(1);
    });

    it('Accepts up to 5 photos for Lithophane Lamp', async () => {
      const buffer1 = Buffer.from('fake image 1');
      const buffer2 = Buffer.from('fake image 2');
      const buffer3 = Buffer.from('fake image 3');
      const buffer4 = Buffer.from('fake image 4');
      const buffer5 = Buffer.from('fake image 5');

      const res = await request(app)
        .post('/api/customization/upload')
        .set('Authorization', `Bearer ${customerToken}`)
        .field('productId', lithophaneLampId)
        .field('currentCount', '0')
        .attach('images', buffer1, 'p1.jpg')
        .attach('images', buffer2, 'p2.jpg')
        .attach('images', buffer3, 'p3.jpg')
        .attach('images', buffer4, 'p4.jpg')
        .attach('images', buffer5, 'p5.jpg');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.images.length).toBe(5);
    });

    it('Rejects 6th photo upload exceeding maximum allowed photos (max 5)', async () => {
      const buffer1 = Buffer.from('img1');
      const buffer2 = Buffer.from('img2');
      const buffer3 = Buffer.from('img3');
      const buffer4 = Buffer.from('img4');
      const buffer5 = Buffer.from('img5');
      const buffer6 = Buffer.from('img6');

      const res = await request(app)
        .post('/api/customization/upload')
        .set('Authorization', `Bearer ${customerToken}`)
        .field('productId', lithophaneLampId)
        .field('currentCount', '0')
        .attach('images', buffer1, 'p1.jpg')
        .attach('images', buffer2, 'p2.jpg')
        .attach('images', buffer3, 'p3.jpg')
        .attach('images', buffer4, 'p4.jpg')
        .attach('images', buffer5, 'p5.jpg')
        .attach('images', buffer6, 'p6.jpg');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/Maximum allowed photos/i);
    });
  });

  describe('Step 6 & 10: Admin Product Update Regression & Validation Tests', () => {
    it('Admin can successfully update normal Table Lamp with requiresImageUpload: false', async () => {
      const updatePayload = {
        name: 'Parametric Spiral LED Table Lamp (Updated)',
        price: 1899,
        mrp: 2499,
        stockQuantity: 30,
        requiresCustomization: false,
        requiresImageUpload: false,
        minimumImageUploads: 1,
        maximumImageUploads: 5,
        isActive: true
      };

      const res = await request(app)
        .put(`/api/products/${tableLampId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.requiresImageUpload).toBe(false);
      expect(res.body.requiresCustomization).toBe(false);
      expect(res.body.price).toBe(1899);
      expect(res.body.stockQuantity).toBe(30);
    });

    it('Admin can successfully update Lithophane Lamp with requiresImageUpload: true, min: 1, max: 5', async () => {
      const updatePayload = {
        name: 'Personalized 3D Printed Photo Lithophane Moon Lamp (Customized Edition)',
        price: 1599,
        mrp: 2299,
        stockQuantity: 25,
        requiresCustomization: false,
        requiresImageUpload: true,
        minimumImageUploads: 1,
        maximumImageUploads: 5,
        isActive: true
      };

      const res = await request(app)
        .put(`/api/products/${lithophaneLampId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.requiresImageUpload).toBe(true);
      expect(res.body.minimumImageUploads).toBe(1);
      expect(res.body.maximumImageUploads).toBe(5);
      expect(res.body.price).toBe(1599);
    });

    it('Admin product update fails if invalid categoryId is supplied', async () => {
      const updatePayload = {
        categoryId: 'non-existent-cat-999'
      };

      const res = await request(app)
        .put(`/api/products/${tableLampId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatePayload);

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/does not exist/i);
    });
  });
});
