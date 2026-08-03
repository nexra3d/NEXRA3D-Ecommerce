import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../src/lib/prisma';

describe('1. Registration, 2. Login & 3. JWT Authentication', () => {
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  let userToken = '';
  let userId = '';

  it('1. Should successfully register a new user and return JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        name: 'Test Auth User'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toBe(testEmail.toLowerCase());

    userToken = res.body.token;
    userId = res.body.user.id;

    // Verify DB state
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    expect(dbUser).not.toBeNull();
    expect(dbUser?.email).toBe(testEmail.toLowerCase());
  });

  it('2. Should login existing user with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(testEmail.toLowerCase());
  });

  it('3. Should fail login with invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('3. Should retrieve authenticated profile using JWT token header', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toHaveProperty('id', userId);
    expect(res.body.user.email).toBe(testEmail.toLowerCase());
  });

  it('3. Should return null user for unauthenticated profile request', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.user).toBeNull();
  });
});
