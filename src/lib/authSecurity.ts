import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CookieOptions } from 'express';

// ==========================================
// 1. JWT & SECRETS MANAGEMENT
// ==========================================

const RAW_JWT_SECRET = process.env.JWT_SECRET;
if (!RAW_JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('[SECURITY CRITICAL] JWT_SECRET environment variable is missing in production!');
}

// Generate an ephemeral cryptographic secret for local development if JWT_SECRET is unset
const DEV_FALLBACK_SECRET = crypto.randomBytes(32).toString('hex');
export const JWT_SECRET = RAW_JWT_SECRET || DEV_FALLBACK_SECRET;
export const ACCESS_TOKEN_EXPIRY = '24h'; // 24-hour expiration for active access tokens

// In-memory token revocation blacklist (persists during process lifetime)
const revokedTokens = new Map<string, number>();

// Cleanup expired entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, expiry] of revokedTokens.entries()) {
    if (expiry < now) {
      revokedTokens.delete(token);
    }
  }
}, 30 * 60 * 1000);

export function revokeToken(token: string, expiryMs = 24 * 60 * 60 * 1000): void {
  if (!token) return;
  const hash = hashToken(token);
  revokedTokens.set(hash, Date.now() + expiryMs);
}

export function isTokenRevoked(token: string): boolean {
  if (!token) return true;
  const hash = hashToken(token);
  const expiry = revokedTokens.get(hash);
  if (!expiry) return false;
  if (expiry < Date.now()) {
    revokedTokens.delete(hash);
    return false;
  }
  return true;
}

export function signUserToken(
  payload: { userId: string; email: string; role: string },
  expiresIn = ACCESS_TOKEN_EXPIRY
): string {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email.toLowerCase().trim(),
      role: payload.role
    },
    JWT_SECRET,
    { expiresIn: expiresIn as any }
  );
}

export function verifyUserToken(token: string): { userId: string; email: string; role: string } | null {
  if (!token || isTokenRevoked(token)) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    if (!decoded || (!decoded.userId && !decoded.email)) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function getAuthCookieOptions(isProd: boolean): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  };
}

// ==========================================
// 2. PASSWORD HASHING & STRENGTH
// ==========================================

const BCRYPT_SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

export function validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required.' };
  }
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (password.length > 128) {
    return { isValid: false, message: 'Password cannot exceed 128 characters.' };
  }
  // Must contain at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  if (!hasLetter || !hasNumber) {
    return {
      isValid: false,
      message: 'Password must contain at least one letter and one number.'
    };
  }

  // Prevent common weak trivial passwords
  const commonWeak = ['password123', 'admin1234', '12345678', 'qwerty123', 'pass1234'];
  if (commonWeak.includes(password.toLowerCase())) {
    return {
      isValid: false,
      message: 'Password is too common. Please choose a more secure password.'
    };
  }

  return { isValid: true };
}

// ==========================================
// 3. CRYPTOGRAPHIC TOKENS (SHA-256 HASHED)
// ==========================================

export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ==========================================
// 4. RATE LIMITING & BRUTE FORCE DEFENSE
// ==========================================

interface RateLimitRecord {
  count: number;
  firstAttemptTime: number;
  lockoutUntil?: number;
}

class InMemoryRateLimiter {
  private records = new Map<string, RateLimitRecord>();
  private windowMs: number;
  private maxAttempts: number;
  private lockoutDurationMs: number;

  constructor(options: { windowMs: number; maxAttempts: number; lockoutDurationMs?: number }) {
    this.windowMs = options.windowMs;
    this.maxAttempts = options.maxAttempts;
    this.lockoutDurationMs = options.lockoutDurationMs || options.windowMs;

    // Periodic sweep
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, record] of this.records.entries()) {
      if (record.lockoutUntil && record.lockoutUntil > now) continue;
      if (now - record.firstAttemptTime > this.windowMs) {
        this.records.delete(key);
      }
    }
  }

  /**
   * Check if a key is currently blocked
   */
  public check(key: string): { isAllowed: boolean; retryAfterSeconds: number; remainingAttempts: number } {
    const now = Date.now();
    const record = this.records.get(key);

    if (!record) {
      return { isAllowed: true, retryAfterSeconds: 0, remainingAttempts: this.maxAttempts };
    }

    // Check lockout
    if (record.lockoutUntil && record.lockoutUntil > now) {
      const retryAfter = Math.ceil((record.lockoutUntil - now) / 1000);
      return { isAllowed: false, retryAfterSeconds: retryAfter, remainingAttempts: 0 };
    }

    // Check window expiration
    if (now - record.firstAttemptTime > this.windowMs) {
      this.records.delete(key);
      return { isAllowed: true, retryAfterSeconds: 0, remainingAttempts: this.maxAttempts };
    }

    if (record.count >= this.maxAttempts) {
      // Trigger lockout
      record.lockoutUntil = now + this.lockoutDurationMs;
      const retryAfter = Math.ceil(this.lockoutDurationMs / 1000);
      return { isAllowed: false, retryAfterSeconds: retryAfter, remainingAttempts: 0 };
    }

    return {
      isAllowed: true,
      retryAfterSeconds: 0,
      remainingAttempts: Math.max(0, this.maxAttempts - record.count)
    };
  }

  /**
   * Record a failed attempt
   */
  public recordFailure(key: string): { isAllowed: boolean; retryAfterSeconds: number; remainingAttempts: number } {
    const now = Date.now();
    let record = this.records.get(key);

    if (!record || now - record.firstAttemptTime > this.windowMs) {
      record = { count: 1, firstAttemptTime: now };
      this.records.set(key, record);
    } else {
      record.count += 1;
    }

    if (record.count >= this.maxAttempts) {
      record.lockoutUntil = now + this.lockoutDurationMs;
      const retryAfter = Math.ceil(this.lockoutDurationMs / 1000);
      return { isAllowed: false, retryAfterSeconds: retryAfter, remainingAttempts: 0 };
    }

    return {
      isAllowed: true,
      retryAfterSeconds: 0,
      remainingAttempts: this.maxAttempts - record.count
    };
  }

  /**
   * Reset on successful authentication
   */
  public reset(key: string) {
    this.records.delete(key);
  }
}

// 1. Strict Login Limiter: Max 5 failed attempts per 15 minutes, with 15-minute account/IP lockout
export const loginRateLimiter = new InMemoryRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000
});

// 2. Registration Limiter: Max 5 registrations per IP per hour
export const registerRateLimiter = new InMemoryRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxAttempts: 5,
  lockoutDurationMs: 30 * 60 * 1000
});

// 3. Password Reset Request Limiter: Max 3 requests per 15 minutes per IP / email
export const forgotPasswordRateLimiter = new InMemoryRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxAttempts: 3,
  lockoutDurationMs: 15 * 60 * 1000
});

// 4. Reset Password Action Limiter: Max 5 attempts per 15 minutes
export const resetPasswordActionRateLimiter = new InMemoryRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000
});

// 5. Resend Email Verification Limiter: Max 3 requests per 15 minutes
export const emailVerificationRateLimiter = new InMemoryRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxAttempts: 3,
  lockoutDurationMs: 15 * 60 * 1000
});

/**
 * Helper to extract client IP safely
 */
export function getClientIp(req: any): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ipList = typeof forwarded === 'string' ? forwarded.split(',') : forwarded;
    if (ipList.length > 0) return ipList[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || '127.0.0.1';
}
