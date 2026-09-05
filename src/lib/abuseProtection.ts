/**
 * Comprehensive Abuse Protection & Multi-Tier Rate Limiting Engine
 * 
 * Provides:
 * 1. Multi-tier sliding window rate limiters:
 *    - Login attempts (Brute-force protection & account lockouts)
 *    - Account creation (Registration flood & fake account mitigation)
 *    - Password reset & email verification requests
 *    - AI generation requests (LLM token exhaustion & resource throttling)
 *    - General API burst protection
 *    - Anti-scraping catalog rate limiter
 * 2. Bot & Automated Script Detection (Scraper signatures, headless browsers, abnormal query bursts)
 * 3. Honeypot trap routes for trapping aggressive scrapers and vulnerability crawlers
 * 4. Standard RFC RateLimit & Retry-After HTTP headers
 * 5. Real-time telemetry and admin management
 */

import { Request, Response, NextFunction } from 'express';
import { recordSecurityEvent } from './securityLogger';
import { getClientIp } from './authSecurity';

export interface RateLimitOptions {
  name: string;
  windowMs: number;
  maxAttempts: number;
  lockoutDurationMs?: number;
  keyGenerator?: (req: Request) => string;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

export interface RateLimitStatus {
  isAllowed: boolean;
  totalLimit: number;
  remaining: number;
  resetSeconds: number;
  retryAfterSeconds: number;
}

interface ClientTrackingRecord {
  count: number;
  windowStart: number;
  consecutiveViolations: number;
  lockoutUntil?: number;
}

export class AdvancedRateLimiter {
  private records = new Map<string, ClientTrackingRecord>();
  public readonly name: string;
  public readonly windowMs: number;
  public readonly maxAttempts: number;
  public readonly lockoutDurationMs: number;
  private keyGenerator: (req: Request) => string;
  private defaultMessage: string;

  constructor(options: RateLimitOptions) {
    this.name = options.name;
    this.windowMs = options.windowMs;
    this.maxAttempts = options.maxAttempts;
    this.lockoutDurationMs = options.lockoutDurationMs || options.windowMs;
    this.keyGenerator = options.keyGenerator || ((req) => getClientIp(req));
    this.defaultMessage = options.message || `Too many requests to ${options.name}. Please try again later.`;

    // Periodic sweep for expired memory records
    setInterval(() => this.cleanup(), Math.max(5 * 60 * 1000, this.windowMs));
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, record] of this.records.entries()) {
      if (record.lockoutUntil && record.lockoutUntil > now) continue;
      if (now - record.windowStart > this.windowMs * 2) {
        this.records.delete(key);
      }
    }
  }

  public check(key: string): RateLimitStatus {
    const now = Date.now();
    const record = this.records.get(key);

    if (!record) {
      return {
        isAllowed: true,
        totalLimit: this.maxAttempts,
        remaining: this.maxAttempts,
        resetSeconds: Math.ceil(this.windowMs / 1000),
        retryAfterSeconds: 0
      };
    }

    // Active lockout check
    if (record.lockoutUntil && record.lockoutUntil > now) {
      const retryAfter = Math.ceil((record.lockoutUntil - now) / 1000);
      return {
        isAllowed: false,
        totalLimit: this.maxAttempts,
        remaining: 0,
        resetSeconds: retryAfter,
        retryAfterSeconds: retryAfter
      };
    }

    // Check if current window has expired
    if (now - record.windowStart > this.windowMs) {
      this.records.delete(key);
      return {
        isAllowed: true,
        totalLimit: this.maxAttempts,
        remaining: this.maxAttempts,
        resetSeconds: Math.ceil(this.windowMs / 1000),
        retryAfterSeconds: 0
      };
    }

    const remaining = Math.max(0, this.maxAttempts - record.count);
    const resetSeconds = Math.ceil((record.windowStart + this.windowMs - now) / 1000);

    if (record.count >= this.maxAttempts) {
      record.consecutiveViolations = (record.consecutiveViolations || 0) + 1;
      // Exponential penalty for repeat offenders (up to 4x base lockout)
      const multiplier = Math.min(4, Math.pow(2, record.consecutiveViolations - 1));
      const effectiveLockout = this.lockoutDurationMs * multiplier;
      record.lockoutUntil = now + effectiveLockout;
      const retryAfter = Math.ceil(effectiveLockout / 1000);

      return {
        isAllowed: false,
        totalLimit: this.maxAttempts,
        remaining: 0,
        resetSeconds: retryAfter,
        retryAfterSeconds: retryAfter
      };
    }

    return {
      isAllowed: true,
      totalLimit: this.maxAttempts,
      remaining,
      resetSeconds,
      retryAfterSeconds: 0
    };
  }

  public increment(key: string, cost = 1): RateLimitStatus {
    const now = Date.now();
    let record = this.records.get(key);

    if (!record || now - record.windowStart > this.windowMs) {
      record = {
        count: cost,
        windowStart: now,
        consecutiveViolations: record?.consecutiveViolations || 0
      };
      this.records.set(key, record);
    } else {
      record.count += cost;
    }

    if (record.count > this.maxAttempts) {
      record.consecutiveViolations = (record.consecutiveViolations || 0) + 1;
      const multiplier = Math.min(4, Math.pow(2, record.consecutiveViolations - 1));
      const effectiveLockout = this.lockoutDurationMs * multiplier;
      record.lockoutUntil = now + effectiveLockout;
      const retryAfter = Math.ceil(effectiveLockout / 1000);

      return {
        isAllowed: false,
        totalLimit: this.maxAttempts,
        remaining: 0,
        resetSeconds: retryAfter,
        retryAfterSeconds: retryAfter
      };
    }

    const remaining = Math.max(0, this.maxAttempts - record.count);
    const resetSeconds = Math.ceil((record.windowStart + this.windowMs - now) / 1000);

    return {
      isAllowed: true,
      totalLimit: this.maxAttempts,
      remaining,
      resetSeconds,
      retryAfterSeconds: 0
    };
  }

  public reset(key: string) {
    this.records.delete(key);
  }

  public manualBlock(key: string, durationMs: number) {
    const now = Date.now();
    const record = this.records.get(key) || {
      count: this.maxAttempts + 1,
      windowStart: now,
      consecutiveViolations: 2
    };
    record.lockoutUntil = now + durationMs;
    this.records.set(key, record);
  }

  public getActiveThrottledCount(): number {
    const now = Date.now();
    let count = 0;
    for (const record of this.records.values()) {
      if (record.lockoutUntil && record.lockoutUntil > now) {
        count++;
      }
    }
    return count;
  }

  public getRecordsList(): Array<{ key: string; count: number; lockedUntil?: string; violations: number }> {
    const now = Date.now();
    const list = [];
    for (const [key, record] of this.records.entries()) {
      list.push({
        key,
        count: record.count,
        lockedUntil: record.lockoutUntil && record.lockoutUntil > now ? new Date(record.lockoutUntil).toISOString() : undefined,
        violations: record.consecutiveViolations
      });
    }
    return list;
  }

  /**
   * Generates Express middleware for this rate limiter
   */
  public middleware(cost = 1) {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = this.keyGenerator(req);
      const status = this.increment(key, cost);

      // Attach standard RFC and legacy rate limit headers
      res.setHeader('RateLimit-Limit', status.totalLimit);
      res.setHeader('RateLimit-Remaining', status.remaining);
      res.setHeader('RateLimit-Reset', status.resetSeconds);
      res.setHeader('X-RateLimit-Limit', status.totalLimit);
      res.setHeader('X-RateLimit-Remaining', status.remaining);
      res.setHeader('X-RateLimit-Reset', status.resetSeconds);

      if (!status.isAllowed) {
        res.setHeader('Retry-After', status.retryAfterSeconds);

        recordSecurityEvent({
          level: 'WARN',
          type: 'RATE_LIMIT_EXCEEDED',
          ip: getClientIp(req),
          userAgent: req.headers['user-agent'],
          method: req.method,
          path: req.originalUrl,
          message: `Rate limit threshold exceeded for [${this.name}]. Throttled for ${status.retryAfterSeconds}s.`,
          details: { limiter: this.name, key, retryAfterSeconds: status.retryAfterSeconds }
        });

        return res.status(429).json({
          error: this.defaultMessage,
          limiter: this.name,
          retryAfterSeconds: status.retryAfterSeconds,
          message: `Too many requests. Please wait ${status.retryAfterSeconds} seconds before retrying.`
        });
      }

      next();
    };
  }
}

// =========================================================================
// PRE-CONFIGURED MULTI-TIER RATE LIMITERS
// =========================================================================

// 1. Strict Login Limiter: 5 attempts per 15 minutes per IP/Account with exponential lockout
export const loginRateLimiter = new AdvancedRateLimiter({
  name: 'auth_login',
  windowMs: 15 * 60 * 1000,
  maxAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000,
  keyGenerator: (req) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const ip = getClientIp(req);
    return email ? `login:${ip}:${email}` : `login:${ip}`;
  },
  message: 'Too many failed login attempts. For your security, this account/IP is temporarily locked. Please try again in 15 minutes.'
});

// 2. Account Registration Limiter: Max 5 new accounts per hour per IP (Mitigates account generation bots)
export const accountCreationRateLimiter = new AdvancedRateLimiter({
  name: 'account_creation',
  windowMs: 60 * 60 * 1000, // 1 hour
  maxAttempts: 5,
  lockoutDurationMs: 30 * 60 * 1000,
  message: 'Account creation rate limit reached. Please wait before registering another account.'
});

// 3. Password Reset Request Limiter: Max 3 password reset emails per 15 minutes per IP/Email
export const passwordResetRateLimiter = new AdvancedRateLimiter({
  name: 'password_reset',
  windowMs: 15 * 60 * 1000,
  maxAttempts: 3,
  lockoutDurationMs: 15 * 60 * 1000,
  keyGenerator: (req) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const ip = getClientIp(req);
    return email ? `pwd_reset:${ip}:${email}` : `pwd_reset:${ip}`;
  },
  message: 'Too many password reset requests. Please check your inbox or try again in 15 minutes.'
});

// 4. AI Generation & LLM Inference Rate Limiter: Max 10 generative requests per 10 minutes per IP/User
export const aiGenerationRateLimiter = new AdvancedRateLimiter({
  name: 'ai_generation',
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxAttempts: 10,
  lockoutDurationMs: 10 * 60 * 1000,
  keyGenerator: (req) => {
    const userId = (req as any).user?.id || (req as any).user?.email;
    const ip = getClientIp(req);
    return userId ? `ai:${userId}` : `ai_ip:${ip}`;
  },
  message: 'AI generation quota reached for this window. Please wait a few minutes before submitting new generation queries.'
});

// 5. Anti-Scraping & Product Catalog Harvester Limiter: Max 60 requests per minute for public catalog listings
export const antiScrapingRateLimiter = new AdvancedRateLimiter({
  name: 'anti_scraping_catalog',
  windowMs: 60 * 1000, // 1 minute
  maxAttempts: 60,
  lockoutDurationMs: 2 * 60 * 1000, // 2 minutes
  message: 'Data query rate limit reached. Automated scraping is restricted. Please slow down your requests.'
});

// 6. General API Rate Limiter: Max 120 API requests per minute per IP for regular REST endpoints
export const generalApiRateLimiter = new AdvancedRateLimiter({
  name: 'general_api',
  windowMs: 60 * 1000, // 1 minute
  maxAttempts: 120,
  lockoutDurationMs: 60 * 1000,
  message: 'API rate limit exceeded. Please throttle your client requests.'
});

// 7. Contact / Quote Request Submission Limiter: Max 5 submissions per 15 minutes per IP
export const quoteSubmissionRateLimiter = new AdvancedRateLimiter({
  name: 'quote_submissions',
  windowMs: 15 * 60 * 1000,
  maxAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000,
  message: 'Quote request submission limit reached. Please wait before submitting another request.'
});

// =========================================================================
// BOT & AUTOMATED SCRIPT DETECTION
// =========================================================================

// Known scraper / automated bot User-Agent signatures (case-insensitive substrings)
const SCRAPER_USER_AGENT_SIGNATURES = [
  'curl/',
  'python-requests',
  'python-urllib',
  'aiohttp',
  'httpx',
  'scrapy',
  'go-http-client',
  'postmanruntime',
  'postman',
  'insomnia',
  'httpclient',
  'apache-httpclient',
  'java/',
  'libwww-perl',
  'mechanize',
  'phpcrawl',
  'webharvest',
  'headlesschrome',
  'puppeteer',
  'phantomjs',
  'selenium',
  'playwright',
  'wget/',
  'sqlmap',
  'nikto',
  'nmap',
  'masscan',
  'zgrab',
  'gobuster',
  'dirbuster'
];

// Legitimate search crawlers and preview bots to allow
const VERIFIED_SEARCH_CRAWLERS = [
  'googlebot',
  'bingbot',
  'duckduckbot',
  'yandexbot',
  'slurp',
  'baiduspider',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'pinterestbot',
  'applebot'
];

// Track IPs blacklisted by honeypot or malicious bot activity
const blacklistedIps = new Map<string, { reason: string; expiresAt: number }>();

export function blacklistIp(ip: string, reason: string, durationMs = 24 * 60 * 60 * 1000) {
  blacklistedIps.set(ip, {
    reason,
    expiresAt: Date.now() + durationMs
  });
}

export function isIpBlacklisted(ip: string): { blacklisted: boolean; reason?: string } {
  const entry = blacklistedIps.get(ip);
  if (!entry) return { blacklisted: false };
  if (entry.expiresAt < Date.now()) {
    blacklistedIps.delete(ip);
    return { blacklisted: false };
  }
  return { blacklisted: true, reason: entry.reason };
}

/**
 * Bot & Automated Script Protection Middleware
 */
export function botProtectionMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = getClientIp(req);
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const rawPath = req.originalUrl || req.url || '';

  // 1. Check IP Blacklist
  const blacklistStatus = isIpBlacklisted(ip);
  if (blacklistStatus.blacklisted) {
    recordSecurityEvent({
      level: 'SECURITY_ALERT',
      type: 'ACCESS_DENIED_403',
      ip,
      userAgent,
      method: req.method,
      path: rawPath,
      message: `Blocked request from blacklisted IP: ${blacklistStatus.reason}`
    });
    return res.status(403).json({
      error: 'Access permanently restricted due to automated abuse detection.',
      code: 'IP_BLOCKED'
    });
  }

  // 2. Allow legitimate search engine indexers
  const isSearchCrawler = VERIFIED_SEARCH_CRAWLERS.some(crawler => userAgent.includes(crawler));
  if (isSearchCrawler && req.method === 'GET') {
    return next();
  }

  // 3. Detect Scraper / Crawler Signatures on data API endpoints
  if (rawPath.startsWith('/api/')) {
    const isKnownScraper = SCRAPER_USER_AGENT_SIGNATURES.some(sig => userAgent.includes(sig));

    // If User-Agent is empty or explicitly matches a known CLI/scraper library on non-health routes
    if ((!userAgent || isKnownScraper) && !rawPath.startsWith('/api/health')) {
      // In development mode or admin bypass, allow if admin header is provided
      if (req.headers['x-admin-bypass'] === 'true' && process.env.NODE_ENV !== 'production') {
        return next();
      }

      recordSecurityEvent({
        level: 'WARN',
        type: 'SECURITY_PROBE',
        ip,
        userAgent,
        method: req.method,
        path: rawPath,
        message: `Automated script or scraping tool signature detected: [${userAgent || 'EMPTY_USER_AGENT'}]`
      });

      // Throttle and challenge automated scraping tool
      res.setHeader('Retry-After', '30');
      return res.status(429).json({
        error: 'Automated script or scraper detected. Direct automated polling without authentication is restricted.',
        code: 'BOT_ACCESS_RESTRICTED',
        retryAfterSeconds: 30
      });
    }
  }

  next();
}

/**
 * Honeypot Trap Route Handler
 * Any automated bot/crawler traversing hidden honeypot links is trapped and blacklisted
 */
export function honeypotTrapHandler(req: Request, res: Response) {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'];

  blacklistIp(ip, `Triggered honeypot trap at ${req.originalUrl}`, 24 * 60 * 60 * 1000);

  recordSecurityEvent({
    level: 'SECURITY_ALERT',
    type: 'SECURITY_PROBE',
    ip,
    userAgent,
    method: req.method,
    path: req.originalUrl,
    message: `Honeypot trap triggered! Blacklisted IP for 24 hours.`
  });

  return res.status(403).json({ error: 'Access denied' });
}

/**
 * Get comprehensive abuse protection statistics (for Admin Security Tab)
 */
export function getAbuseProtectionStats() {
  return {
    limiters: [
      { name: loginRateLimiter.name, activeThrottledIps: loginRateLimiter.getActiveThrottledCount(), windowMinutes: 15, maxAttempts: 5 },
      { name: accountCreationRateLimiter.name, activeThrottledIps: accountCreationRateLimiter.getActiveThrottledCount(), windowMinutes: 60, maxAttempts: 5 },
      { name: passwordResetRateLimiter.name, activeThrottledIps: passwordResetRateLimiter.getActiveThrottledCount(), windowMinutes: 15, maxAttempts: 3 },
      { name: aiGenerationRateLimiter.name, activeThrottledIps: aiGenerationRateLimiter.getActiveThrottledCount(), windowMinutes: 10, maxAttempts: 10 },
      { name: antiScrapingRateLimiter.name, activeThrottledIps: antiScrapingRateLimiter.getActiveThrottledCount(), windowMinutes: 1, maxAttempts: 60 },
      { name: generalApiRateLimiter.name, activeThrottledIps: generalApiRateLimiter.getActiveThrottledCount(), windowMinutes: 1, maxAttempts: 120 }
    ],
    blacklistedIpsCount: blacklistedIps.size,
    blacklistedIpsList: Array.from(blacklistedIps.entries()).map(([ip, data]) => ({
      ip,
      reason: data.reason,
      expiresAt: new Date(data.expiresAt).toISOString()
    })),
    timestamp: new Date().toISOString()
  };
}

export function clearBlacklist() {
  blacklistedIps.clear();
}
