/**
 * Security, Audit Logging & Threat Detection Engine
 * 
 * Provides:
 * 1. Structured security audit logging (Auth attempts, API errors, authorization violations)
 * 2. Suspicious traffic pattern & probe detection (Rate spikes, SQL/XSS payloads, path traversal, scanner probes)
 * 3. Secret masking & PII redaction
 * 4. In-memory rolling security buffer & metrics for administrative monitoring
 */

export type SecurityLogLevel = 'INFO' | 'WARN' | 'SECURITY_ALERT' | 'ERROR';

export type SecurityEventType =
  | 'AUTH_SUCCESS'
  | 'AUTH_FAILURE'
  | 'AUTH_LOGOUT'
  | 'AUTH_REGISTER'
  | 'PASSWORD_RESET_REQ'
  | 'PASSWORD_RESET_EXEC'
  | 'EMAIL_VERIFY'
  | 'ACCESS_DENIED_403'
  | 'UNAUTHENTICATED_401'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SUSPICIOUS_PAYLOAD'
  | 'SECURITY_PROBE'
  | 'TRAFFIC_SPIKE'
  | 'IDOR_PREVENTED'
  | 'API_ERROR_500'
  | 'DATABASE_ERROR';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  level: SecurityLogLevel;
  type: SecurityEventType;
  ip: string;
  userAgent?: string;
  method?: string;
  path?: string;
  userId?: string;
  userEmail?: string;
  message: string;
  details?: Record<string, any>;
}

// In-memory buffer storing recent security events for admin audit
const MAX_LOG_ENTRIES = 1000;
const auditLogBuffer: SecurityEvent[] = [];

// Threat tracking: Suspicious IP activity & rate anomaly detector
interface IpTrafficProfile {
  requestCount: number;
  errorCount: number;
  authFailureCount: number;
  lastWindowReset: number;
  blockedUntil?: number;
}

const ipProfiles = new Map<string, IpTrafficProfile>();

// Cleanup stale IP profiles every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, profile] of ipProfiles.entries()) {
    if (now - profile.lastWindowReset > 15 * 60 * 1000) {
      ipProfiles.delete(ip);
    }
  }
}, 15 * 60 * 1000);

/**
 * Mask sensitive secrets, tokens, passwords, and keys from logs
 */
export function maskSensitiveData(data: any): any {
  if (!data) return data;
  if (typeof data === 'string') {
    // If it looks like a JWT or key
    if (data.startsWith('ey') && data.includes('.')) {
      return `${data.substring(0, 10)}...[MASKED_JWT]`;
    }
    if (data.length > 20 && /^[a-zA-Z0-9_-]+$/.test(data)) {
      return `${data.substring(0, 4)}...[MASKED_KEY]`;
    }
    return data;
  }
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(maskSensitiveData);
  }

  const masked: Record<string, any> = {};
  const sensitiveKeys = [
    'password', 'newpassword', 'oldpassword', 'confirmpassword',
    'token', 'accesstoken', 'refreshtoken', 'jwt', 'secret',
    'apikey', 'key', 'razorpay_signature', 'cvv', 'cardnumber',
    'database_url', 'direct_url', 'cookie', 'authorization'
  ];

  for (const [k, v] of Object.entries(data)) {
    const lowerKey = k.toLowerCase().replace(/[-_]/g, '');
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      masked[k] = '[REDACTED_SECRET]';
    } else {
      masked[k] = maskSensitiveData(v);
    }
  }
  return masked;
}

/**
 * Mask a secret string for safe display (e.g., in status dashboards)
 */
export function maskSecretString(secret?: string | null): string {
  if (!secret) return '[NOT_CONFIGURED]';
  if (secret.length <= 6) return '******';
  return `${secret.substring(0, 3)}...${secret.substring(secret.length - 3)}`;
}

/**
 * Core security event recording function
 */
export function recordSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): SecurityEvent {
  const securityEvent: SecurityEvent = {
    id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...event,
    details: event.details ? maskSensitiveData(event.details) : undefined
  };

  // Add to in-memory audit log buffer
  auditLogBuffer.unshift(securityEvent);
  if (auditLogBuffer.length > MAX_LOG_ENTRIES) {
    auditLogBuffer.pop();
  }

  // Structured console log for container/Cloud Run log ingestion
  const logPrefix = `[SECURITY][${securityEvent.level}][${securityEvent.type}]`;
  const ipInfo = securityEvent.ip ? `[IP: ${securityEvent.ip}]` : '';
  const user = securityEvent.userEmail ? `[User: ${securityEvent.userEmail}]` : '';
  const path = securityEvent.path ? `[Path: ${securityEvent.method || 'GET'} ${securityEvent.path}]` : '';

  if (securityEvent.level === 'ERROR' || securityEvent.level === 'SECURITY_ALERT') {
    console.error(`${logPrefix}${ipInfo}${user}${path} ${securityEvent.message}`, securityEvent.details || '');
  } else if (securityEvent.level === 'WARN') {
    console.warn(`${logPrefix}${ipInfo}${user}${path} ${securityEvent.message}`, securityEvent.details || '');
  } else {
    console.log(`${logPrefix}${ipInfo}${user}${path} ${securityEvent.message}`);
  }

  return securityEvent;
}

/**
 * Known malicious probe patterns for vulnerability scanning detection
 */
const SUSPICIOUS_PATH_PATTERNS = [
  /\.\.\//,                  // Path traversal (Unix)
  /\.\.\\/,                  // Path traversal (Windows)
  /\/\.env/i,                // Environment file probe
  /\/\.git/i,                // Git repository probe
  /\/wp-admin/i,             // WordPress probe
  /\/wp-login/i,             // WordPress login probe
  /\/phpmyadmin/i,           // phpMyAdmin probe
  /\/actuator/i,             // Spring Boot actuator probe
  /\/etc\/passwd/i,          // Linux passwd file probe
  /\/proc\/self/i,           // Proc filesystem probe
  /\/cgi-bin/i,              // CGI-bin probe
  /\.php$/i,                 // PHP script probe on Node backend
  /\.aspx?$/i,               // ASP.NET script probe
  /\.sql$/i                  // Raw SQL file probe
];

const SUSPICIOUS_PAYLOAD_PATTERNS = [
  /(\bunion\b.*\bselect\b)/i,              // SQL injection: UNION SELECT
  /(\bor\b\s+['"]?1['"]?\s*=\s*['"]?1)/i, // SQL injection: OR 1=1
  /(;\s*drop\s+table)/i,                   // SQL injection: DROP TABLE
  /(<script\b[^>]*>)/i,                    // Basic XSS script tag
  /(javascript:\s*)/i,                     // javascript: URI scheme
  /(\$\{jndi:(ldap|rmi|dns):)/i,           // Log4j / JNDI injection
  /(\bexec\s*\(|\bsystem\s*\()/i           // Command execution patterns
];

/**
 * Traffic Inspector Middleware to detect suspicious patterns and scanner probes
 */
export function inspectTrafficAndThreats(req: any, res: any, next: any) {
  const ip = req.headers['x-forwarded-for']
    ? String(req.headers['x-forwarded-for']).split(',')[0].trim()
    : req.socket?.remoteAddress || '127.0.0.1';

  const rawPath = req.originalUrl || req.url || '';
  const now = Date.now();

  // Track IP traffic profile for traffic spike / anomaly detection
  let profile = ipProfiles.get(ip);
  if (!profile || now - profile.lastWindowReset > 60 * 1000) {
    profile = {
      requestCount: 0,
      errorCount: 0,
      authFailureCount: 0,
      lastWindowReset: now
    };
    ipProfiles.set(ip, profile);
  }
  profile.requestCount++;

  // 1. Detect Scanner / Malicious Path Probes
  for (const pattern of SUSPICIOUS_PATH_PATTERNS) {
    if (pattern.test(rawPath)) {
      recordSecurityEvent({
        level: 'SECURITY_ALERT',
        type: 'SECURITY_PROBE',
        ip,
        userAgent: req.headers['user-agent'],
        method: req.method,
        path: rawPath,
        message: `Blocked suspicious scanner probe matching pattern: ${pattern.toString()}`,
        details: { query: req.query, headers: maskSensitiveData(req.headers) }
      });
      return res.status(404).json({ error: 'Not found' });
    }
  }

  // 2. Inspect Query Params and Body for Attack Payloads
  const payloadInspectString = `${rawPath} ${JSON.stringify(req.query || {})} ${JSON.stringify(req.body || {})}`;
  for (const pattern of SUSPICIOUS_PAYLOAD_PATTERNS) {
    if (pattern.test(payloadInspectString)) {
      recordSecurityEvent({
        level: 'SECURITY_ALERT',
        type: 'SUSPICIOUS_PAYLOAD',
        ip,
        userAgent: req.headers['user-agent'],
        method: req.method,
        path: rawPath,
        message: `Detected attack payload pattern: ${pattern.toString()}`,
        details: { query: req.query, body: maskSensitiveData(req.body) }
      });
      return res.status(400).json({ error: 'Malformed or disallowed request payload detected.' });
    }
  }

  // 3. Traffic Spike / Rate Anomaly Detection (Threshold: >150 req/minute from single IP)
  if (profile.requestCount > 150) {
    recordSecurityEvent({
      level: 'WARN',
      type: 'TRAFFIC_SPIKE',
      ip,
      userAgent: req.headers['user-agent'],
      method: req.method,
      path: rawPath,
      message: `Unusual traffic rate detected: ${profile.requestCount} requests within 60s window.`,
      details: { requestCount: profile.requestCount }
    });
  }

  // Hook into response finish to capture errors and latency
  res.on('finish', () => {
    if (res.statusCode >= 500) {
      profile!.errorCount++;
      recordSecurityEvent({
        level: 'ERROR',
        type: 'API_ERROR_500',
        ip,
        userAgent: req.headers['user-agent'],
        method: req.method,
        path: rawPath,
        message: `Server Error ${res.statusCode} on ${req.method} ${rawPath}`,
        details: { statusCode: res.statusCode, statusMessage: res.statusMessage }
      });
    } else if (res.statusCode === 403) {
      recordSecurityEvent({
        level: 'WARN',
        type: 'ACCESS_DENIED_403',
        ip,
        userAgent: req.headers['user-agent'],
        method: req.method,
        path: rawPath,
        message: `Access denied (403 Forbidden) on ${req.method} ${rawPath}`,
        userId: req.user?.id,
        userEmail: req.user?.email
      });
    } else if (res.statusCode === 401 && !rawPath.startsWith('/api/auth/me')) {
      recordSecurityEvent({
        level: 'INFO',
        type: 'UNAUTHENTICATED_401',
        ip,
        userAgent: req.headers['user-agent'],
        method: req.method,
        path: rawPath,
        message: `Unauthenticated access attempt (401) on ${req.method} ${rawPath}`
      });
    }
  });

  next();
}

/**
 * Retrieve recent security audit events (for Admin Dashboard)
 */
export function getSecurityAuditLogs(options?: {
  limit?: number;
  type?: SecurityEventType;
  level?: SecurityLogLevel;
}): SecurityEvent[] {
  const limit = options?.limit || 100;
  let logs = auditLogBuffer;

  if (options?.type) {
    logs = logs.filter(l => l.type === options.type);
  }
  if (options?.level) {
    logs = logs.filter(l => l.level === options.level);
  }

  return logs.slice(0, limit);
}

/**
 * Get aggregated security metrics
 */
export function getSecurityMetrics() {
  const now = Date.now();
  const last24h = now - 24 * 60 * 60 * 1000;
  const recentLogs = auditLogBuffer.filter(l => new Date(l.timestamp).getTime() > last24h);

  const totalEvents = recentLogs.length;
  const authFailures = recentLogs.filter(l => l.type === 'AUTH_FAILURE').length;
  const authSuccesses = recentLogs.filter(l => l.type === 'AUTH_SUCCESS').length;
  const rateLimitHits = recentLogs.filter(l => l.type === 'RATE_LIMIT_EXCEEDED').length;
  const securityAlerts = recentLogs.filter(l => l.level === 'SECURITY_ALERT').length;
  const serverErrors = recentLogs.filter(l => l.level === 'ERROR').length;
  const accessDenied = recentLogs.filter(l => l.type === 'ACCESS_DENIED_403').length;

  return {
    period: 'last_24_hours',
    totalEvents,
    authSuccesses,
    authFailures,
    rateLimitHits,
    securityAlerts,
    serverErrors,
    accessDenied,
    activeMonitoredIps: ipProfiles.size,
    timestamp: new Date().toISOString()
  };
}
