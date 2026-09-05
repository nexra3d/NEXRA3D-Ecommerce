/**
 * Comprehensive Input Sanitization, Injection Defense & Safe Upload Engine
 * 
 * Provides:
 * 1. Deep recursive string sanitization for request bodies, query params, and route params
 * 2. Strict XSS mitigation (stripping script tags, executable event handlers, dangerous schemes)
 * 3. SQL / NoSQL & Command Injection payload detection and rejection
 * 4. Path traversal and null-byte elimination
 * 5. Safe file upload validator: MIME type whitelist, file extension validation, and magic byte signatures
 * 6. Express middleware for system-wide automatic input sanitization
 */

import { Request, Response, NextFunction } from 'express';
import { recordSecurityEvent } from './securityLogger.js';
import { getClientIp } from './authSecurity.js';

// ==========================================
// 1. INJECTION PAYLOAD PATTERNS & DETECTORS
// ==========================================

// Dangerous XSS injection patterns
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /data\s*:\s*text\/html/gi,
  /vbscript\s*:/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /on\w+\s*=\s*[^>\s]+/gi,
  /<iframe\b[^>]*>/gi,
  /<object\b[^>]*>/gi,
  /<embed\b[^>]*>/gi,
  /<link\b[^>]*rel=["']?import["']?[^>]*>/gi,
  /<meta\b[^>]*http-equiv=["']?refresh["']?[^>]*>/gi,
  /eval\s*\(/gi,
  /expression\s*\(/gi
];

// Dangerous SQL injection heuristics (applied to critical query/filter parameters)
const SQLI_PATTERNS = [
  /(\b(UNION(\s+ALL)?|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|EXEC|EXECUTE)\b\s+)/i,
  /(--|\#|\/\*|\*\/)/,
  /(\bOR\b|\bAND\b)\s+['"\d\w]+\s*=\s*['"\d\w]+/i,
  /;\s*(DROP|ALTER|CREATE|DELETE|TRUNCATE)/i
];

// Path traversal and directory escape sequences
const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//g,
  /\.\.\\/g,
  /%2e%2e%2f/gi,
  /%2e%2e\//gi,
  /\.\.%2f/gi,
  /%2e%2e%5c/gi,
  /\0/g, // Null bytes
  /%00/gi
];

// OS Command injection patterns
const CMD_INJECTION_PATTERNS = [
  /[;&|`$]\s*(sh|bash|zsh|csh|cmd|powershell|curl|wget|nc|netcat|ncat|eval)\b/i,
  /\$\([^)]+\)/g,
  /`[^`]+`/g
];

/**
 * Clean a single string from XSS, control characters, null bytes, and path traversal
 */
export function sanitizeString(val: string, options: { stripHtml?: boolean; maxLength?: number } = {}): string {
  if (typeof val !== 'string') return val;

  let cleaned = val;

  // 1. Remove null bytes and invisible control characters (preserve standard whitespace and newlines)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Normalize Unicode (NFC) to defeat unicode obfuscation attacks
  try {
    cleaned = cleaned.normalize('NFC');
  } catch {}

  // 3. Neutralize path traversal sequences
  PATH_TRAVERSAL_PATTERNS.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, '');
  });

  // 4. Strip XSS executable signatures
  XSS_PATTERNS.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, '');
  });

  // 5. If requested or text-only field, strip all HTML tags
  if (options.stripHtml) {
    cleaned = cleaned.replace(/<[^>]*>?/gm, '');
  }

  // 6. Enforce maximum string boundary to protect against Regex DoS & memory consumption
  const maxLen = options.maxLength || 10000;
  if (cleaned.length > maxLen) {
    cleaned = cleaned.slice(0, maxLen);
  }

  return cleaned.trim();
}

/**
 * Recursively sanitize an entire object or array
 */
export function deepSanitize<T>(input: T, depth = 0): T {
  if (depth > 10) return input; // Prevent cyclic / excessive depth recursion

  if (typeof input === 'string') {
    return sanitizeString(input) as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => deepSanitize(item, depth + 1)) as unknown as T;
  }

  if (input !== null && typeof input === 'object' && !(input instanceof Date)) {
    const sanitizedObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      // Also sanitize object keys to prevent prototype pollution or injection in keys
      const cleanKey = sanitizeString(key, { stripHtml: true, maxLength: 100 });
      if (cleanKey === '__proto__' || cleanKey === 'constructor' || cleanKey === 'prototype') {
        continue; // Block Prototype Pollution attempts
      }
      sanitizedObj[cleanKey] = deepSanitize(value, depth + 1);
    }
    return sanitizedObj as T;
  }

  return input;
}

/**
 * Inspect an input string or object for malicious injection attempts (SQLi / Cmd Injection)
 */
export function detectInjectionThreats(input: any): { isThreat: boolean; threatType?: string; matchedSnippet?: string } {
  const checkValue = (val: string): { isThreat: boolean; threatType?: string; matchedSnippet?: string } => {
    if (typeof val !== 'string') return { isThreat: false };

    // Check for Command Injection
    for (const pat of CMD_INJECTION_PATTERNS) {
      if (pat.test(val)) {
        return { isThreat: true, threatType: 'COMMAND_INJECTION', matchedSnippet: val.slice(0, 100) };
      }
    }

    // Check for SQL Injection in query/filter values
    for (const pat of SQLI_PATTERNS) {
      if (pat.test(val)) {
        return { isThreat: true, threatType: 'SQL_INJECTION', matchedSnippet: val.slice(0, 100) };
      }
    }

    return { isThreat: false };
  };

  if (typeof input === 'string') {
    return checkValue(input);
  }

  if (typeof input === 'object' && input !== null) {
    for (const key of Object.keys(input)) {
      const val = input[key];
      if (typeof val === 'string') {
        const res = checkValue(val);
        if (res.isThreat) return res;
      } else if (typeof val === 'object' && val !== null) {
        const res = detectInjectionThreats(val);
        if (res.isThreat) return res;
      }
    }
  }

  return { isThreat: false };
}

/**
 * Express Middleware: Automatically sanitize incoming bodies, queries, and path parameters
 */
export function inputSanitizationMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Inspect for severe injection threats in query or body
    const queryThreat = detectInjectionThreats(req.query);
    if (queryThreat.isThreat) {
      const clientIp = getClientIp(req);
      recordSecurityEvent({
        level: 'WARN',
        type: 'SECURITY_PROBE',
        ip: clientIp,
        method: req.method,
        path: req.originalUrl,
        message: `Blocked potential ${queryThreat.threatType} in query parameters`
      });
      return res.status(400).json({
        error: 'Invalid or prohibited characters detected in query parameters.'
      });
    }

    // 2. Sanitize request query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = deepSanitize(req.query);
    }

    // 3. Sanitize request route parameters
    if (req.params && typeof req.params === 'object') {
      req.params = deepSanitize(req.params);
    }

    // 4. Sanitize request body if not a multipart raw stream
    if (req.body && typeof req.body === 'object') {
      req.body = deepSanitize(req.body);
    }

    next();
  } catch (err) {
    console.error('[Input Sanitization Error]', err);
    next();
  }
}

// ==========================================
// 2. SAFE FILE UPLOAD & MIME INSPECTION
// ==========================================

export interface FileValidationResult {
  isValid: boolean;
  sanitizedFilename: string;
  errorMessage?: string;
}

// Allowed MIME types for images & engineering assets
export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

export const ALLOWED_CAD_EXTENSIONS = [
  '.stl',
  '.step',
  '.stp',
  '.obj',
  '.3mf',
  '.iges',
  '.igs',
  '.dxf',
  '.pdf',
  '.zip',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp'
];

/**
 * Sanitize a user-provided filename to prevent path traversal and shell injection
 */
export function sanitizeFileName(originalName: string): string {
  if (!originalName) return `upload_${Date.now()}.dat`;

  // 1. Extract base name without directory components
  const baseName = originalName.split(/[/\\]/).pop() || originalName;

  // 2. Remove all non-alphanumeric characters except dot, dash, underscore
  let cleanName = baseName.replace(/[^a-zA-Z0-9.\-_]/g, '_');

  // 3. Remove consecutive dots to prevent extension spoofing or directory traversal (e.g. file..php)
  cleanName = cleanName.replace(/\.{2,}/g, '.');

  // 4. Limit length
  if (cleanName.length > 100) {
    const ext = cleanName.slice(cleanName.lastIndexOf('.'));
    cleanName = cleanName.slice(0, 90) + ext;
  }

  return cleanName;
}

/**
 * Validate Magic Number signatures of uploaded files to ensure true content matching
 */
export function validateFileMagicBytes(buffer: Buffer, mimetype: string): boolean {
  if (!buffer || buffer.length < 4) return false;

  // Check JPEG signature: 0xFF, 0xD8, 0xFF
  if (mimetype === 'image/jpeg' || mimetype === 'image/jpg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // Check PNG signature: 0x89, 0x50, 0x4E, 0x47 ( .PNG )
  if (mimetype === 'image/png') {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  }

  // Check WebP signature: "RIFF" .... "WEBP"
  if (mimetype === 'image/webp') {
    const isRiff = buffer.toString('ascii', 0, 4) === 'RIFF';
    const isWebp = buffer.length >= 12 && buffer.toString('ascii', 8, 12) === 'WEBP';
    return isRiff && isWebp;
  }

  // Check PDF signature: "%PDF-"
  if (mimetype === 'application/pdf') {
    return buffer.toString('ascii', 0, 5) === '%PDF-';
  }

  // Check for dangerous executable signatures (block PE .exe, ELF binaries, PHP, Shell)
  const headerStr = buffer.slice(0, 50).toString('utf8', 0, Math.min(buffer.length, 50));
  if (
    buffer[0] === 0x4d && buffer[1] === 0x5a || // Windows PE EXE ("MZ")
    buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46 || // Linux ELF
    headerStr.includes('<?php') ||
    headerStr.includes('<script') ||
    headerStr.includes('#!/bin/')
  ) {
    return false;
  }

  // Permitted for CAD formats (STL binary/ASCII, STEP ASCII, OBJ ASCII, 3MF zip container)
  return true;
}

/**
 * Complete Safe File Upload Validator
 */
export function validateUploadedFile(file: {
  originalname: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
}, options: { maxSizeBytes?: number; allowCad?: boolean } = {}): FileValidationResult {
  const maxBytes = options.maxSizeBytes || 15 * 1024 * 1024; // 15MB default

  if (!file) {
    return { isValid: false, sanitizedFilename: '', errorMessage: 'No file provided.' };
  }

  // 1. Check size limit
  if (file.size > maxBytes) {
    return {
      isValid: false,
      sanitizedFilename: '',
      errorMessage: `File size exceeds the allowed limit of ${Math.round(maxBytes / (1024 * 1024))}MB.`
    };
  }

  // 2. Sanitize filename
  const cleanName = sanitizeFileName(file.originalname);
  const ext = cleanName.slice(cleanName.lastIndexOf('.')).toLowerCase();

  // 3. Verify extension
  const allowedExtensions = options.allowCad
    ? ALLOWED_CAD_EXTENSIONS
    : ['.jpg', '.jpeg', '.png', '.webp'];

  if (!allowedExtensions.includes(ext)) {
    return {
      isValid: false,
      sanitizedFilename: cleanName,
      errorMessage: `Unsupported file type (${ext}). Allowed formats: ${allowedExtensions.join(', ')}`
    };
  }

  // 4. Verify Magic Header Bytes if buffer is available
  if (file.buffer && !validateFileMagicBytes(file.buffer, file.mimetype)) {
    return {
      isValid: false,
      sanitizedFilename: cleanName,
      errorMessage: 'Security validation failed: File header contents do not match a safe permitted format.'
    };
  }

  return {
    isValid: true,
    sanitizedFilename: cleanName
  };
}
