import { PrismaClient } from '@prisma/client';
import { memoryStore } from './memoryDb.js';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

let rawPrisma: any;
try {
  rawPrisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: ['error'],
    });
} catch (e) {
  console.warn('[AI Studio] PrismaClient initialization warning:', e);
  rawPrisma = {};
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = rawPrisma;
}

const dbUrl = (process.env.DATABASE_URL || '').trim();
const isPlaceholderDbUrl =
  !dbUrl ||
  dbUrl.includes('user:password') ||
  dbUrl.includes('localhost') ||
  dbUrl.includes('127.0.0.1') ||
  dbUrl.startsWith('file:') ||
  dbUrl.includes('sample');

const hasDatabaseUrl = !isPlaceholderDbUrl;

let dbSchemaEnsured = false;

export async function ensureDbSchema(): Promise<void> {
  if (!hasDatabaseUrl) {
    return;
  }
  if (dbSchemaEnsured) return;

  try {
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
    `);

    try {
      await rawPrisma.$executeRawUnsafe(`
        ALTER TABLE "custom_orders" ADD COLUMN IF NOT EXISTS "customOrderName" TEXT;
        ALTER TABLE "custom_orders" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
        ALTER TABLE "custom_orders" ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT false;
      `);
    } catch (_) {}

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
          "isApproved" BOOLEAN NOT NULL DEFAULT false,
          "status" TEXT NOT NULL DEFAULT 'PENDING',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "custom_order_reviews_pkey" PRIMARY KEY ("id")
        );
      `);
    } catch (_) {}

    try {
      await rawPrisma.$executeRawUnsafe(`
        ALTER TABLE "custom_order_reviews" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'PENDING';
        ALTER TABLE "custom_order_reviews" ADD COLUMN IF NOT EXISTS "userName" TEXT;
      `);
    } catch (_) {}

    try {
      await rawPrisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "custom_orders_phone_idx" ON "custom_orders"("phone");
      `);
      await rawPrisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "custom_orders_paymentStatus_idx" ON "custom_orders"("paymentStatus");
      `);
      await rawPrisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "custom_orders_isPublic_idx" ON "custom_orders"("isPublic");
      `);
      await rawPrisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "custom_order_reviews_order_idx" ON "custom_order_reviews"("customOrderId");
      `);
    } catch (_) {}

    dbSchemaEnsured = true;
    console.log('[Database] custom_orders table and indexes ensured successfully.');
  } catch (err: any) {
    console.warn('[Database] Could not execute DDL for custom_orders:', err?.message || err);
  }
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
