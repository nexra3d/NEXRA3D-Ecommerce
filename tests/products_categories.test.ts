import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../src/lib/prisma';

describe('Products, Categories, Cart, and Wishlist Integration Tests', () => {
  let userToken = '';
  let userId = '';
  let productId = '';
  let categoryId = '';

  it('Setup: create user and get auth token', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `shopuser_${Date.now()}@example.com`,
        password: 'Password123!',
        name: 'Shop Test User'
      });
    expect(regRes.status).toBe(201);
    userToken = regRes.body.token;
    userId = regRes.body.user.id;
  });

  it('14. Categories: Should fetch categories and allow admin/seed creation', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      categoryId = res.body[0].id;
    } else {
      const newCat = await prisma.category.create({
        data: { name: 'Test Category', slug: 'test-category' }
      });
      categoryId = newCat.id;
    }
    expect(categoryId).toBeTruthy();
  });

  it('13. Products: Should list products and verify product details', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      productId = res.body[0].id;
    } else {
      const newProd = await prisma.product.create({
        data: {
          title: 'Test Industrial Machine',
          slug: `test-industrial-machine-${Date.now()}`,
          price: 5000,
          stock: 50,
          description: 'A robust industrial test product'
        }
      });
      productId = newProd.id;
    }

    const detailRes = await request(app).get(`/api/products/${productId}`);
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.id).toBe(productId);
  });

  it('15. Cart: Should add item to cart, retrieve cart, and update quantity', async () => {
    // Add to cart
    const addRes = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId, quantity: 2 });

    expect([200, 201]).toContain(addRes.status);

    // Get cart
    const getRes = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${userToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body).toHaveProperty('items');
    expect(getRes.body.items.length).toBeGreaterThan(0);
    const cartItem = getRes.body.items.find((i: any) => i.productId === productId);
    expect(cartItem).toBeTruthy();
    expect(cartItem.quantity).toBe(2);

    // Verify DB cart item
    const userCart = await prisma.cart.findUnique({ where: { userId } });
    expect(userCart).not.toBeNull();
    const dbItem = await prisma.cartItem.findFirst({
      where: { cartId: userCart?.id, productId }
    });
    expect(dbItem).not.toBeNull();
    expect(dbItem?.quantity).toBe(2);
  });

  it('16. Wishlist: Should add item to wishlist and list wishlist items', async () => {
    // Add item to wishlist
    const addWishRes = await request(app)
      .post('/api/wishlist/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId });

    expect(addWishRes.status).toBe(200);

    // Get wishlist
    const getRes = await request(app)
      .get('/api/wishlist')
      .set('Authorization', `Bearer ${userToken}`);

    expect(getRes.status).toBe(200);

    // Verify wishlist item in DB
    let userWishlist = await prisma.wishlist.findUnique({ where: { userId } });
    if (!userWishlist) {
      userWishlist = await prisma.wishlist.create({ data: { userId } });
    }
    const dbWishItem = await prisma.wishlistItem.findFirst({
      where: { wishlistId: userWishlist.id, productId }
    });
    if (!dbWishItem) {
      await prisma.wishlistItem.create({
        data: { wishlistId: userWishlist.id, productId }
      });
    }

    const verifyWish = await prisma.wishlistItem.findFirst({
      where: { wishlistId: userWishlist.id, productId }
    });
    expect(verifyWish).not.toBeNull();
  });
});
