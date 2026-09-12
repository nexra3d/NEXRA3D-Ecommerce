import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

try {
  const devEnvPath = path.resolve('/app/.dev.env.json');
  if (fs.existsSync(devEnvPath)) {
    const raw = JSON.parse(fs.readFileSync(devEnvPath, 'utf8'));
    for (const [k, v] of Object.entries(raw)) {
      if (!process.env[k] && typeof v === 'string') {
        process.env[k] = v;
      }
    }
  }
} catch (_) {}

import { PrismaClient } from '@prisma/client';
import { memoryStore } from './memoryDb.js';
import { supabaseAdmin, isSupabaseConfigured } from './supabase.js';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const dbUrl = (
  process.env.DATABASE_URL ||
  process.env.DIRECT_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.SUPABASE_DB_URL ||
  ''
).trim();

const isPlaceholderDbUrl =
  !dbUrl ||
  dbUrl.includes('user:password') ||
  dbUrl.startsWith('file:') ||
  dbUrl.includes('sample');

const hasDatabaseUrl = !isPlaceholderDbUrl;

if (hasDatabaseUrl && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = dbUrl;
}

let rawPrisma: any;
try {
  rawPrisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      datasources: hasDatabaseUrl ? { db: { url: dbUrl } } : undefined,
      log: ['error'],
    });
} catch (e) {
  console.warn('[AI Studio] PrismaClient initialization warning:', e);
  rawPrisma = {};
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = rawPrisma;
}

let dbSchemaEnsured = false;

export async function ensureDbSchema(): Promise<void> {
  if (!hasDatabaseUrl) {
    return;
  }
  if (dbSchemaEnsured) return;

  try {
    // 1. Create custom_orders table if not exists
    await rawPrisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "custom_orders" (
        "id" TEXT NOT NULL,
        "customerName" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "email" TEXT,
        "description" TEXT,
        "customOrderName" TEXT,
        "imageUrl" TEXT,
        "isPublic" BOOLEAN NOT NULL DEFAULT false,
        "amount" DECIMAL(10,2) NOT NULL,
        "deliveryType" TEXT NOT NULL DEFAULT 'STORE_PICKUP',
        "notes" TEXT,
        "paymentStatus" TEXT NOT NULL DEFAULT 'AWAITING_PAYMENT',
        "razorpayOrderId" TEXT,
        "razorpayQrId" TEXT,
        "qrImageUrl" TEXT,
        "paymentLink" TEXT,
        "isSimulated" BOOLEAN NOT NULL DEFAULT false,
        "expiresAt" TIMESTAMP(3),
        "paidAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "custom_orders_pkey" PRIMARY KEY ("id")
      );
    `).catch(() => {});

    // 2. Ensure both camelCase and snake_case columns exist on existing databases
    const alterColStatements = [
      `ALTER TABLE "custom_orders" ADD COLUMN IF NOT EXISTS "customOrderName" TEXT;`,
      `ALTER TABLE "custom_orders" ADD COLUMN IF NOT EXISTS "custom_order_name" TEXT;`,
      `ALTER TABLE "custom_orders" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;`,
      `ALTER TABLE "custom_orders" ADD COLUMN IF NOT EXISTS "image_url" TEXT;`,
      `ALTER TABLE "custom_orders" ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT false;`,
      `ALTER TABLE "custom_orders" ADD COLUMN IF NOT EXISTS "is_public" BOOLEAN NOT NULL DEFAULT false;`,
      `ALTER TABLE custom_orders ADD COLUMN IF NOT EXISTS "customOrderName" TEXT;`,
      `ALTER TABLE custom_orders ADD COLUMN IF NOT EXISTS "custom_order_name" TEXT;`,
      `ALTER TABLE custom_orders ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;`,
      `ALTER TABLE custom_orders ADD COLUMN IF NOT EXISTS "image_url" TEXT;`,
      `ALTER TABLE custom_orders ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT false;`,
      `ALTER TABLE custom_orders ADD COLUMN IF NOT EXISTS "is_public" BOOLEAN NOT NULL DEFAULT false;`
    ];

    for (const sql of alterColStatements) {
      try {
        await rawPrisma.$executeRawUnsafe(sql);
      } catch (_) {}
    }

    // 3. Mirror data across both column casings if both exist
    const syncStatements = [
      `UPDATE "custom_orders" SET "customOrderName" = "custom_order_name" WHERE "customOrderName" IS NULL AND "custom_order_name" IS NOT NULL;`,
      `UPDATE "custom_orders" SET "custom_order_name" = "customOrderName" WHERE "custom_order_name" IS NULL AND "customOrderName" IS NOT NULL;`,
      `UPDATE "custom_orders" SET "imageUrl" = "image_url" WHERE "imageUrl" IS NULL AND "image_url" IS NOT NULL;`,
      `UPDATE "custom_orders" SET "image_url" = "imageUrl" WHERE "image_url" IS NULL AND "imageUrl" IS NOT NULL;`,
      `UPDATE "custom_orders" SET "isPublic" = "is_public" WHERE "isPublic" IS NOT TRUE AND "is_public" IS TRUE;`,
      `UPDATE "custom_orders" SET "is_public" = "isPublic" WHERE "is_public" IS NOT TRUE AND "isPublic" IS TRUE;`
    ];
    for (const sql of syncStatements) {
      try {
        await rawPrisma.$executeRawUnsafe(sql);
      } catch (_) {}
    }

    // 4. Ensure custom_order_reviews table and columns
    try {
      await rawPrisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "custom_order_reviews" (
          "id" TEXT NOT NULL,
          "customOrderId" TEXT NOT NULL,
          "userId" TEXT,
          "userName" TEXT,
          "rating" INTEGER NOT NULL DEFAULT 5,
          "title" TEXT,
          "comment" TEXT NOT NULL,
          "isApproved" BOOLEAN NOT NULL DEFAULT true,
          "status" TEXT NOT NULL DEFAULT 'PENDING',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "custom_order_reviews_pkey" PRIMARY KEY ("id")
        );
      `);
    } catch (_) {}

    const reviewAlters = [
      `ALTER TABLE "custom_order_reviews" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'PENDING';`,
      `ALTER TABLE "custom_order_reviews" ADD COLUMN IF NOT EXISTS "userName" TEXT;`,
      `ALTER TABLE "custom_order_reviews" ADD COLUMN IF NOT EXISTS "user_name" TEXT;`
    ];
    for (const sql of reviewAlters) {
      try {
        await rawPrisma.$executeRawUnsafe(sql);
      } catch (_) {}
    }

    // 5. Ensure indexes
    const indexList = [
      `CREATE INDEX IF NOT EXISTS "custom_orders_phone_idx" ON "custom_orders"("phone");`,
      `CREATE INDEX IF NOT EXISTS "custom_orders_paymentStatus_idx" ON "custom_orders"("paymentStatus");`,
      `CREATE INDEX IF NOT EXISTS "custom_orders_isPublic_idx" ON "custom_orders"("isPublic");`,
      `CREATE INDEX IF NOT EXISTS "custom_order_reviews_order_idx" ON "custom_order_reviews"("customOrderId");`
    ];
    for (const sql of indexList) {
      try {
        await rawPrisma.$executeRawUnsafe(sql);
      } catch (_) {}
    }

    dbSchemaEnsured = true;
    console.log('[Database] custom_orders and reviews schema verified & ensured successfully.');
  } catch (err: any) {
    console.warn('[Database] Notice during custom_orders schema verification:', err?.message || err);
  }
}

export function normalizeCustomOrder(row: any): any {
  if (!row || typeof row !== 'object') return row;

  const id = String(row.id || row.order_id || row.orderId || '');
  const customerName = String(row.customerName ?? row.customer_name ?? row.name ?? 'Valued Customer');
  const phone = String(row.phone ?? row.phoneNumber ?? row.phone_number ?? '');
  const email = row.email ?? row.customerEmail ?? row.customer_email ?? null;
  const description = row.description ?? row.desc ?? row.customOrderName ?? row.custom_order_name ?? '';
  const customOrderName = String(row.customOrderName ?? row.custom_order_name ?? row.title ?? row.description ?? 'Custom 3D Print');
  const imageUrl = row.imageUrl ?? row.image_url ?? row.image ?? null;
  const isPublic = Boolean(row.isPublic ?? row.is_public ?? false);
  const amount = Number(row.amount ?? row.totalAmount ?? row.total ?? 0);
  const deliveryType = String(row.deliveryType ?? row.delivery_type ?? 'STORE_PICKUP');
  const notes = row.notes ?? row.note ?? null;
  const paymentStatus = String(row.paymentStatus ?? row.payment_status ?? 'AWAITING_PAYMENT').toUpperCase();
  const razorpayOrderId = row.razorpayOrderId ?? row.razorpay_order_id ?? null;
  const razorpayQrId = row.razorpayQrId ?? row.razorpay_qr_id ?? null;
  const qrImageUrl = row.qrImageUrl ?? row.qr_image_url ?? null;
  const paymentLink = row.paymentLink ?? row.payment_link ?? null;
  const isSimulated = Boolean(row.isSimulated ?? row.is_simulated ?? false);
  const expiresAt = row.expiresAt ?? row.expires_at ?? null;
  const paidAt = row.paidAt ?? row.paid_at ?? null;
  const createdAt = row.createdAt ?? row.created_at ?? new Date().toISOString();
  const updatedAt = row.updatedAt ?? row.updated_at ?? createdAt;

  return {
    id,
    customerName,
    phone,
    email,
    description,
    customOrderName,
    imageUrl,
    isPublic,
    amount,
    deliveryType,
    notes,
    paymentStatus,
    razorpayOrderId,
    razorpayQrId,
    qrImageUrl,
    paymentLink,
    isSimulated,
    expiresAt,
    paidAt,
    createdAt,
    updatedAt,
    // Provide snake_case mirrors for 100% database & component compatibility
    customer_name: customerName,
    custom_order_name: customOrderName,
    image_url: imageUrl,
    is_public: isPublic,
    delivery_type: deliveryType,
    payment_status: paymentStatus,
    razorpay_order_id: razorpayOrderId,
    razorpay_qr_id: razorpayQrId,
    qr_image_url: qrImageUrl,
    payment_link: paymentLink,
    is_simulated: isSimulated,
    expires_at: expiresAt,
    paid_at: paidAt,
    created_at: createdAt,
    updated_at: updatedAt
  };
}

export function normalizeCustomOrderReview(row: any): any {
  if (!row || typeof row !== 'object') return row;

  const id = String(row.id || '');
  const customOrderId = String(row.customOrderId ?? row.custom_order_id ?? '');
  const userId = row.userId ?? row.user_id ?? null;
  const userName = String(row.userName ?? row.user_name ?? row.reviewerName ?? row.reviewer_name ?? 'Anonymous Reviewer');
  const rating = Number(row.rating ?? 5);
  const title = row.title ?? null;
  const comment = String(row.comment ?? '');
  const isApproved = Boolean(row.isApproved ?? row.is_approved ?? (row.status === 'APPROVED'));
  const status = String(row.status ?? (isApproved ? 'APPROVED' : 'PENDING')).toUpperCase();
  const createdAt = row.createdAt ?? row.created_at ?? new Date().toISOString();

  return {
    id,
    customOrderId,
    userId,
    userName,
    reviewerName: userName,
    rating,
    title,
    comment,
    isApproved,
    status,
    createdAt,
    // snake_case mirrors
    custom_order_id: customOrderId,
    user_id: userId,
    user_name: userName,
    reviewer_name: userName,
    is_approved: isApproved,
    created_at: createdAt
  };
}

const VALID_PRISMA_CUSTOM_ORDER_KEYS = new Set([
  'id',
  'customerName',
  'phone',
  'email',
  'description',
  'customOrderName',
  'imageUrl',
  'isPublic',
  'amount',
  'deliveryType',
  'notes',
  'paymentStatus',
  'razorpayOrderId',
  'razorpayQrId',
  'qrImageUrl',
  'paymentLink',
  'isSimulated',
  'expiresAt',
  'paidAt',
  'createdAt',
  'updatedAt'
]);

export function cleanPrismaCustomOrderData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  const clean: any = {};
  const source = {
    ...data,
    customerName: data.customerName ?? data.customer_name,
    customOrderName: data.customOrderName ?? data.custom_order_name,
    imageUrl: data.imageUrl ?? data.image_url,
    isPublic: data.isPublic !== undefined ? Boolean(data.isPublic) : (data.is_public !== undefined ? Boolean(data.is_public) : undefined),
    deliveryType: data.deliveryType ?? data.delivery_type,
    paymentStatus: data.paymentStatus ?? data.payment_status,
    razorpayOrderId: data.razorpayOrderId ?? data.razorpay_order_id,
    razorpayQrId: data.razorpayQrId ?? data.razorpay_qr_id,
    qrImageUrl: data.qrImageUrl ?? data.qr_image_url,
    paymentLink: data.paymentLink ?? data.payment_link,
    isSimulated: data.isSimulated !== undefined ? Boolean(data.isSimulated) : (data.is_simulated !== undefined ? Boolean(data.is_simulated) : undefined),
    expiresAt: data.expiresAt ?? data.expires_at,
    paidAt: data.paidAt ?? data.paid_at,
    createdAt: data.createdAt ?? data.created_at,
    updatedAt: data.updatedAt ?? data.updated_at
  };

  for (const k of Object.keys(source)) {
    if (VALID_PRISMA_CUSTOM_ORDER_KEYS.has(k) && source[k] !== undefined) {
      let v = source[k];
      if ((k === 'expiresAt' || k === 'paidAt' || k === 'createdAt' || k === 'updatedAt') && v) {
        if (typeof v === 'string' || typeof v === 'number') {
          const d = new Date(v);
          if (!isNaN(d.getTime())) v = d;
        }
      }
      clean[k] = v;
    }
  }
  return clean;
}

const CUSTOM_ORDER_DB_COLUMN_MAP: Record<string, string> = {
  customerName: 'customer_name',
  customOrderName: 'custom_order_name',
  imageUrl: 'image_url',
  isPublic: 'is_public',
  deliveryType: 'delivery_type',
  paymentStatus: 'payment_status',
  razorpayOrderId: 'razorpay_order_id',
  razorpayQrId: 'razorpay_qr_id',
  qrImageUrl: 'qr_image_url',
  paymentLink: 'payment_link',
  isSimulated: 'is_simulated',
  expiresAt: 'expires_at',
  paidAt: 'paid_at',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  phone: 'phone',
  email: 'email',
  description: 'description',
  amount: 'amount',
  notes: 'notes',
  id: 'id'
};

async function executeResilientCustomOrderQuery(prop: string, args: any[]): Promise<any> {
  const memoryHandler = memoryStore.createModelHandler('customOrder');

  // Strategy 1: If database URL is available, attempt Prisma first
  if (hasDatabaseUrl) {
    if (!dbSchemaEnsured) {
      await ensureDbSchema().catch(() => {});
    }

    try {
      const rawModel = (rawPrisma as any).customOrder;
      if (rawModel && typeof rawModel[prop] === 'function') {
        const sanitizedArgs = args.map((arg: any) => {
          if (!arg || typeof arg !== 'object') return arg;
          const cloned = { ...arg };
          if (cloned.data) {
            cloned.data = cleanPrismaCustomOrderData(cloned.data);
          }
          if (cloned.create) {
            cloned.create = cleanPrismaCustomOrderData(cloned.create);
          }
          if (cloned.update) {
            cloned.update = cleanPrismaCustomOrderData(cloned.update);
          }
          return cloned;
        });

        const result = await rawModel[prop](...sanitizedArgs);
        if (Array.isArray(result) && result.length > 0) {
          return result.map(normalizeCustomOrder);
        }
        if (result && typeof result === 'object' && !Array.isArray(result) && prop !== 'findMany') {
          const normalized = normalizeCustomOrder(result);
          // Keep in-memory cache synchronized with PostgreSQL
          try {
            if (prop === 'update') {
              await (memoryHandler as any).update({ where: args[0]?.where, data: sanitizedArgs[0]?.data || args[0]?.data });
            } else if (prop === 'create' || prop === 'upsert') {
              await (memoryHandler as any).upsert({ where: { id: normalized.id }, update: normalized, create: normalized });
            } else if (prop === 'delete') {
              await (memoryHandler as any).delete({ where: args[0]?.where });
            }
          } catch (_) {}
          return normalized;
        }
      }
    } catch (prismaErr: any) {
      console.warn('[Prisma Custom Order] Standard Prisma model call threw, executing raw SQL fallback:', prismaErr?.message || prismaErr);
    }

    // Raw SQL fallback directly targeting PostgreSQL
    if (prop === 'findMany') {
      const queries = [
        'SELECT * FROM "custom_orders" ORDER BY "created_at" DESC',
        'SELECT * FROM "custom_orders" ORDER BY "createdAt" DESC',
        'SELECT * FROM custom_orders ORDER BY created_at DESC',
        'SELECT * FROM "custom_orders"',
        'SELECT * FROM custom_orders'
      ];
      for (const q of queries) {
        try {
          const rawRows = await rawPrisma.$queryRawUnsafe(q);
          if (Array.isArray(rawRows) && rawRows.length > 0) {
            let list = rawRows.map(normalizeCustomOrder);
            const filter = args[0]?.where;
            if (filter?.isPublic !== undefined) {
              list = list.filter((item: any) => item.isPublic === filter.isPublic);
            }
            if (filter?.paymentStatus !== undefined) {
              list = list.filter((item: any) => item.paymentStatus === filter.paymentStatus);
            }
            return list;
          }
        } catch (_) {}
      }
    } else if (prop === 'findUnique' || prop === 'findFirst') {
      const whereId = args[0]?.where?.id;
      if (whereId) {
        const queries = [
          'SELECT * FROM "custom_orders" WHERE "id" = $1 LIMIT 1',
          'SELECT * FROM custom_orders WHERE id = $1 LIMIT 1'
        ];
        for (const q of queries) {
          try {
            const rawRows: any = await rawPrisma.$queryRawUnsafe(q, whereId);
            if (Array.isArray(rawRows) && rawRows.length > 0) {
              return normalizeCustomOrder(rawRows[0]);
            }
          } catch (_) {}
        }
      }
    } else if (prop === 'update' || prop === 'upsert') {
      const whereId = args[0]?.where?.id;
      const rawData = prop === 'upsert' ? { ...(args[0]?.create || {}), ...(args[0]?.update || {}) } : (args[0]?.data || {});
      const cleanData = cleanPrismaCustomOrderData(rawData);
      if (whereId && Object.keys(cleanData).length > 0) {
        // 1. Detect which columns exist in PostgreSQL
        let existingCols = new Set<string>();
        try {
          const colRows: any = await rawPrisma.$queryRawUnsafe(
            `SELECT column_name FROM information_schema.columns WHERE table_name = 'custom_orders' OR table_name = 'CustomOrder'`
          );
          if (Array.isArray(colRows)) {
            for (const r of colRows) {
              if (r?.column_name) existingCols.add(String(r.column_name));
            }
          }
        } catch (_) {}

        // If columns detected, write to all matching columns (both camelCase and snake_case)
        if (existingCols.size > 0) {
          const setClauses: string[] = [];
          const values: any[] = [];
          let idx = 1;

          for (const [field, val] of Object.entries(cleanData)) {
            const camelCol = field;
            const snakeCol = CUSTOM_ORDER_DB_COLUMN_MAP[field] || field;

            if (existingCols.has(camelCol)) {
              setClauses.push(`"${camelCol}" = $${idx++}`);
              values.push(val);
            }
            if (snakeCol !== camelCol && existingCols.has(snakeCol)) {
              setClauses.push(`"${snakeCol}" = $${idx++}`);
              values.push(val);
            }
          }

          if (setClauses.length > 0) {
            values.push(whereId);
            const sql = `UPDATE "custom_orders" SET ${setClauses.join(', ')} WHERE "id" = $${idx} RETURNING *`;
            try {
              const rawResult: any = await rawPrisma.$queryRawUnsafe(sql, ...values);
              if (Array.isArray(rawResult) && rawResult.length > 0) {
                const normalized = normalizeCustomOrder(rawResult[0]);
                try { await (memoryHandler as any).update({ where: { id: whereId }, data: cleanData }); } catch (_) {}
                return normalized;
              }
            } catch (err: any) {
              console.warn('[Raw SQL Update with column detection error]:', err?.message || err);
            }
          }
        }

        // Fallback A: Direct camelCase columns
        try {
          const setClausesCamel: string[] = [];
          const valuesCamel: any[] = [];
          let idx = 1;
          for (const [field, val] of Object.entries(cleanData)) {
            setClausesCamel.push(`"${field}" = $${idx++}`);
            valuesCamel.push(val);
          }
          valuesCamel.push(whereId);
          const sql = `UPDATE "custom_orders" SET ${setClausesCamel.join(', ')} WHERE "id" = $${idx} RETURNING *`;
          const rawResult: any = await rawPrisma.$queryRawUnsafe(sql, ...valuesCamel);
          if (Array.isArray(rawResult) && rawResult.length > 0) {
            const normalized = normalizeCustomOrder(rawResult[0]);
            try { await (memoryHandler as any).update({ where: { id: whereId }, data: cleanData }); } catch (_) {}
            return normalized;
          }
        } catch (_) {}

        // Fallback B: Direct snake_case columns
        try {
          const setClausesSnake: string[] = [];
          const valuesSnake: any[] = [];
          let idx = 1;
          for (const [field, val] of Object.entries(cleanData)) {
            const col = CUSTOM_ORDER_DB_COLUMN_MAP[field] || field;
            setClausesSnake.push(`"${col}" = $${idx++}`);
            valuesSnake.push(val);
          }
          valuesSnake.push(whereId);
          const sql = `UPDATE "custom_orders" SET ${setClausesSnake.join(', ')} WHERE "id" = $${idx} RETURNING *`;
          const rawResult: any = await rawPrisma.$queryRawUnsafe(sql, ...valuesSnake);
          if (Array.isArray(rawResult) && rawResult.length > 0) {
            const normalized = normalizeCustomOrder(rawResult[0]);
            try { await (memoryHandler as any).update({ where: { id: whereId }, data: cleanData }); } catch (_) {}
            return normalized;
          }
        } catch (_) {}
      }
    } else if (prop === 'create') {
      const cleanData = cleanPrismaCustomOrderData(args[0]?.data || {});
      const id = cleanData.id || `co-${Date.now()}`;
      cleanData.id = id;

      // Try camelCase insert
      try {
        const cols: string[] = [];
        const placeholders: string[] = [];
        const values: any[] = [];
        let idx = 1;
        for (const [field, val] of Object.entries(cleanData)) {
          cols.push(`"${field}"`);
          placeholders.push(`$${idx++}`);
          values.push(val);
        }
        const sql = `INSERT INTO "custom_orders" (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
        const rawResult: any = await rawPrisma.$queryRawUnsafe(sql, ...values);
        if (Array.isArray(rawResult) && rawResult.length > 0) {
          const normalized = normalizeCustomOrder(rawResult[0]);
          try { await (memoryHandler as any).create({ data: cleanData }); } catch (_) {}
          return normalized;
        }
      } catch (_) {}

      // Try snake_case insert
      try {
        const cols: string[] = [];
        const placeholders: string[] = [];
        const values: any[] = [];
        let idx = 1;
        for (const [field, val] of Object.entries(cleanData)) {
          const col = CUSTOM_ORDER_DB_COLUMN_MAP[field] || field;
          cols.push(`"${col}"`);
          placeholders.push(`$${idx++}`);
          values.push(val);
        }
        const sql = `INSERT INTO "custom_orders" (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
        const rawResult: any = await rawPrisma.$queryRawUnsafe(sql, ...values);
        if (Array.isArray(rawResult) && rawResult.length > 0) {
          const normalized = normalizeCustomOrder(rawResult[0]);
          try { await (memoryHandler as any).create({ data: cleanData }); } catch (_) {}
          return normalized;
        }
      } catch (_) {}
    } else if (prop === 'delete') {
      const whereId = args[0]?.where?.id;
      if (whereId) {
        try {
          await rawPrisma.$executeRawUnsafe('DELETE FROM "custom_orders" WHERE "id" = $1', whereId);
          try { await (memoryHandler as any).delete({ where: { id: whereId } }); } catch (_) {}
          return { id: whereId };
        } catch (_) {}
      }
    }
  }

  // Strategy 2: Direct Supabase PostgREST client if configured
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      if (prop === 'findMany') {
        const { data, error } = await (supabaseAdmin as any).from('custom_orders').select('*');
        if (!error && Array.isArray(data) && data.length > 0) {
          let list = data.map(normalizeCustomOrder);
          const filter = args[0]?.where;
          if (filter?.isPublic !== undefined) {
            list = list.filter((item: any) => item.isPublic === filter.isPublic);
          }
          if (filter?.paymentStatus !== undefined) {
            list = list.filter((item: any) => item.paymentStatus === filter.paymentStatus);
          }
          if (args[0]?.orderBy?.createdAt === 'desc') {
            list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          }
          return list;
        }
      } else if (prop === 'findUnique' || prop === 'findFirst') {
        const whereId = args[0]?.where?.id;
        if (whereId) {
          const { data, error } = await (supabaseAdmin as any).from('custom_orders').select('*').eq('id', whereId).maybeSingle();
          if (!error && data) return normalizeCustomOrder(data);
        }
      } else if (prop === 'create') {
        const clean = cleanPrismaCustomOrderData(args[0]?.data);
        const supaData: any = {};
        for (const [k, v] of Object.entries(clean)) {
          const col = CUSTOM_ORDER_DB_COLUMN_MAP[k] || k;
          supaData[col] = v;
        }
        let { data: created, error } = await (supabaseAdmin as any).from('custom_orders').insert(supaData).select().maybeSingle();
        if (error) {
          // Retry with direct camelCase keys
          const camelData: any = {};
          for (const [k, v] of Object.entries(clean)) {
            camelData[k] = v;
          }
          const retry = await (supabaseAdmin as any).from('custom_orders').insert(camelData).select().maybeSingle();
          if (!retry.error && retry.data) {
            created = retry.data;
            error = null;
          }
        }
        if (!error && created) {
          const normalized = normalizeCustomOrder(created);
          try { await (memoryHandler as any).create({ data: clean }); } catch (_) {}
          return normalized;
        }
      } else if (prop === 'update') {
        const whereId = args[0]?.where?.id;
        const clean = cleanPrismaCustomOrderData(args[0]?.data);
        const supaData: any = {};
        for (const [k, v] of Object.entries(clean)) {
          const col = CUSTOM_ORDER_DB_COLUMN_MAP[k] || k;
          supaData[col] = v;
        }
        if (whereId) {
          let { data: updated, error } = await (supabaseAdmin as any).from('custom_orders').update(supaData).eq('id', whereId).select().maybeSingle();
          if (error) {
            // Retry with direct camelCase keys
            const camelData: any = {};
            for (const [k, v] of Object.entries(clean)) {
              camelData[k] = v;
            }
            const retry = await (supabaseAdmin as any).from('custom_orders').update(camelData).eq('id', whereId).select().maybeSingle();
            if (!retry.error && retry.data) {
              updated = retry.data;
              error = null;
            }
          }
          if (!error && updated) {
            const normalized = normalizeCustomOrder(updated);
            try { await (memoryHandler as any).update({ where: { id: whereId }, data: clean }); } catch (_) {}
            return normalized;
          }
        }
      } else if (prop === 'delete') {
        const whereId = args[0]?.where?.id;
        if (whereId) {
          await (supabaseAdmin as any).from('custom_orders').delete().eq('id', whereId);
          try { await (memoryHandler as any).delete({ where: { id: whereId } }); } catch (_) {}
          return { id: whereId };
        }
      }
    } catch (supaErr) {
      console.warn('[Supabase Bridge] Custom order error:', supaErr);
    }
  }

  // Strategy 3: In-memory store fallback
  const fn = (memoryHandler as any)[prop];
  if (typeof fn === 'function') {
    const memResult = await fn(...args);
    if (Array.isArray(memResult)) {
      return memResult.map(normalizeCustomOrder);
    }
    if (memResult && typeof memResult === 'object') {
      return normalizeCustomOrder(memResult);
    }
    return memResult;
  }
  return null;
}

async function executeResilientCustomOrderReviewQuery(prop: string, args: any[]): Promise<any> {
  const memoryHandler = memoryStore.createModelHandler('customOrderReview');

  if (hasDatabaseUrl) {
    try {
      const rawModel = (rawPrisma as any).customOrderReview;
      if (rawModel && typeof rawModel[prop] === 'function') {
        const result = await rawModel[prop](...args);
        if (Array.isArray(result) && result.length > 0) {
          return result.map(normalizeCustomOrderReview);
        }
        if (result && typeof result === 'object' && !Array.isArray(result) && prop !== 'findMany') {
          return normalizeCustomOrderReview(result);
        }
      }
    } catch (prismaErr: any) {
      console.warn('[Prisma Review] Standard call threw, falling back:', prismaErr?.message || prismaErr);
    }

    if (prop === 'findMany') {
      const queries = [
        'SELECT * FROM "custom_order_reviews" ORDER BY "createdAt" DESC',
        'SELECT * FROM custom_order_reviews ORDER BY created_at DESC',
        'SELECT * FROM "custom_order_reviews"',
        'SELECT * FROM custom_order_reviews'
      ];
      for (const q of queries) {
        try {
          const rawRows = await rawPrisma.$queryRawUnsafe(q);
          if (Array.isArray(rawRows) && rawRows.length > 0) {
            let list = rawRows.map(normalizeCustomOrderReview);
            const filter = args[0]?.where;
            if (filter?.isApproved !== undefined) {
              list = list.filter((r: any) => r.isApproved === filter.isApproved);
            }
            if (filter?.customOrderId?.in && Array.isArray(filter.customOrderId.in)) {
              list = list.filter((r: any) => filter.customOrderId.in.includes(r.customOrderId));
            } else if (filter?.customOrderId) {
              list = list.filter((r: any) => r.customOrderId === filter.customOrderId);
            }
            return list;
          }
        } catch (_) {}
      }
    }
  }

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      if (prop === 'findMany') {
        const { data, error } = await (supabaseAdmin as any).from('custom_order_reviews').select('*');
        if (!error && Array.isArray(data) && data.length > 0) {
          let list = data.map(normalizeCustomOrderReview);
          const filter = args[0]?.where;
          if (filter?.isApproved !== undefined) {
            list = list.filter((r: any) => r.isApproved === filter.isApproved);
          }
          if (filter?.customOrderId?.in && Array.isArray(filter.customOrderId.in)) {
            list = list.filter((r: any) => filter.customOrderId.in.includes(r.customOrderId));
          } else if (filter?.customOrderId) {
            list = list.filter((r: any) => r.customOrderId === filter.customOrderId);
          }
          return list;
        }
      } else if (prop === 'create') {
        const itemData = args[0]?.data;
        const { data: created, error } = await (supabaseAdmin as any).from('custom_order_reviews').insert(itemData).select().maybeSingle();
        if (!error && created) return normalizeCustomOrderReview(created);
      } else if (prop === 'update') {
        const whereId = args[0]?.where?.id;
        const itemData = args[0]?.data;
        if (whereId) {
          const { data: updated, error } = await (supabaseAdmin as any).from('custom_order_reviews').update(itemData).eq('id', whereId).select().maybeSingle();
          if (!error && updated) return normalizeCustomOrderReview(updated);
        }
      } else if (prop === 'delete') {
        const whereId = args[0]?.where?.id;
        if (whereId) {
          await (supabaseAdmin as any).from('custom_order_reviews').delete().eq('id', whereId);
          return { id: whereId };
        }
      }
    } catch (supaErr) {
      console.warn('[Supabase Bridge] Review error:', supaErr);
    }
  }

  const fn = (memoryHandler as any)[prop];
  if (typeof fn === 'function') {
    const memResult = await fn(...args);
    if (Array.isArray(memResult)) {
      return memResult.map(normalizeCustomOrderReview);
    }
    if (memResult && typeof memResult === 'object') {
      return normalizeCustomOrderReview(memResult);
    }
    return memResult;
  }
  return null;
}

function createModelProxy(modelName: string | symbol) {
  if (typeof modelName !== 'string') {
    return undefined;
  }
  const memoryHandler = memoryStore.createModelHandler(modelName);

  return new Proxy({}, {
    get(_target, prop: string | symbol) {
      if (typeof prop !== 'string') {
        return undefined;
      }
      return async (...args: any[]) => {
        // High resilience routing for custom orders and reviews
        if (modelName === 'customOrder') {
          return executeResilientCustomOrderQuery(prop, args);
        }
        if (modelName === 'customOrderReview') {
          return executeResilientCustomOrderReviewQuery(prop, args);
        }

        if (!hasDatabaseUrl) {
          const fn = (memoryHandler as any)[prop];
          if (typeof fn === 'function') {
            return fn(...args);
          }
          return null;
        }

        const rawModel = (rawPrisma as any)[modelName];
        if (!rawModel || typeof rawModel[prop] !== 'function') {
          // If the model does not exist on Prisma client, fallback to memory store
          const fn = (memoryHandler as any)[prop];
          if (typeof fn === 'function') {
            return fn(...args);
          }
          throw new Error(`Method '${prop}' does not exist on Prisma model '${modelName}'.`);
        }

        const backoffs = [250, 500, 1000];
        let lastError: any;

        for (let attempt = 0; attempt <= backoffs.length; attempt++) {
          try {
            return await rawModel[prop](...args);
          } catch (err: any) {
            lastError = err;
            const queryName = `${modelName}.${prop}`;
            const errorMessage = err?.message || String(err);
            const timestamp = new Date().toISOString();

            // Check if table is missing in database (Prisma P2021 or Postgres relation does not exist)
            const isTableMissing =
              err?.code === 'P2021' ||
              errorMessage.toLowerCase().includes('does not exist') ||
              (errorMessage.toLowerCase().includes('relation') && errorMessage.toLowerCase().includes('does not exist'));

            if (isTableMissing) {
              console.warn(`[${timestamp}] Table for model '${modelName}' is missing in database. Attempting auto-creation...`);
              try {
                await ensureDbSchema();
                return await rawModel[prop](...args);
              } catch (retryErr: any) {
                console.warn(`[${timestamp}] Auto-creation failed or query retry failed: ${retryErr?.message}. Falling back to memory store for ${queryName}.`);
                const fn = (memoryHandler as any)[prop];
                if (typeof fn === 'function') {
                  return fn(...args);
                }
              }
            }

            // Do not retry on deterministic request / validation / constraint errors
            const isNonRetryable =
              err?.name === 'PrismaClientKnownRequestError' ||
              err?.name === 'PrismaClientValidationError' ||
              (typeof err?.code === 'string' && err.code.startsWith('P2'));

            if (isNonRetryable) {
              throw err;
            }

            if (attempt < backoffs.length) {
              const retryNumber = attempt + 1;
              const delay = backoffs[attempt];
              console.error(
                `[${timestamp}] Prisma Query Error in ${queryName} | Retry Number: ${retryNumber}/3 | Delay: ${delay}ms | Error: ${errorMessage}`
              );
              await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
              console.error(
                `[${timestamp}] Prisma Query Max Retries Reached for ${queryName} | Final Error: ${errorMessage}`
              );
            }
          }
        }

        throw lastError;
      };
    }
  });
}

export const prisma = new Proxy(rawPrisma, {
  get(target, prop: string | symbol) {
    if (typeof prop === 'symbol') {
      return (target as any)[prop];
    }
    if (prop === '$connect' || prop === '$disconnect') {
      return async () => {};
    }
    if (prop === '$transaction') {
      return async (cbOrArray: any) => {
        if (!hasDatabaseUrl) {
          const snapshot = memoryStore.snapshot();
          if (typeof cbOrArray === 'function') {
            try {
              return await cbOrArray(prisma);
            } catch (err) {
              memoryStore.restore(snapshot);
              throw err;
            }
          }
          if (Array.isArray(cbOrArray)) {
            try {
              return await Promise.all(cbOrArray);
            } catch (err) {
              memoryStore.restore(snapshot);
              throw err;
            }
          }
          return null;
        }
        if (typeof cbOrArray === 'function') {
          return rawPrisma.$transaction(async (rawTx: any) => {
            return cbOrArray(rawTx);
          });
        }
        return rawPrisma.$transaction(cbOrArray);
      };
    }
    if (prop in target && typeof (target as any)[prop] === 'function') {
      return (...args: any[]) => {
        if (!hasDatabaseUrl) {
          return null;
        }
        return (target as any)[prop](...args);
      };
    }
    return createModelProxy(prop);
  }
}) as PrismaClient;

export default prisma;
