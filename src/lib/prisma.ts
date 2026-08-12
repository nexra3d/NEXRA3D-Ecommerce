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
let dbSchemaPromise: Promise<void> | null = null;

export function ensureDbSchema() {
  if (dbSchemaEnsured || !hasDatabaseUrl || !rawPrisma || typeof rawPrisma.$executeRawUnsafe !== 'function') {
    return Promise.resolve();
  }

  if (!dbSchemaPromise) {
    dbSchemaPromise = (async () => {
      const ddlStatements = [
        `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "weight" DOUBLE PRECISION;`,
        `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "length" DOUBLE PRECISION;`,
        `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "width" DOUBLE PRECISION;`,
        `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "height" DOUBLE PRECISION;`,
        `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "requiresCustomization" BOOLEAN NOT NULL DEFAULT false;`,
        `ALTER TABLE "cart_items" ADD COLUMN IF NOT EXISTS "customizationText" TEXT;`,
        `ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "customizationText" TEXT;`,

        `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shippingProvider" TEXT;`,
        `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "awbNumber" TEXT;`,
        `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "trackingNumber" TEXT;`,
        `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipmentId" TEXT;`,
        `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "estimatedDelivery" TIMESTAMP(3);`,
        `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipmentStatus" TEXT;`,
        `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "pickupRequested" BOOLEAN DEFAULT false;`,
        `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "labelUrl" TEXT;`,
        `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "trackingUrl" TEXT;`,
        `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "manifestUrl" TEXT;`,
        `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "lastTrackingUpdate" TIMESTAMP(3);`,
        `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "trackingHistory" JSONB;`,

        `ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "colour" TEXT;`,
        `ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "wattage" TEXT;`,
        `ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "attributes" JSONB;`,

        `ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "skuSnapshot" TEXT;`,
        `ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "selectedColour" TEXT;`,
        `ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "selectedWattage" TEXT;`,

        `ALTER TABLE "cart_items" ADD COLUMN IF NOT EXISTS "selectedColour" TEXT;`,
        `ALTER TABLE "cart_items" ADD COLUMN IF NOT EXISTS "selectedWattage" TEXT;`,

        `CREATE TABLE IF NOT EXISTS "product_images" (
          "id" TEXT NOT NULL,
          "productId" TEXT NOT NULL,
          "url" TEXT NOT NULL,
          "publicId" TEXT,
          "altText" TEXT,
          "sortOrder" INTEGER NOT NULL DEFAULT 0,
          "isPrimary" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
        );`,

        `CREATE TABLE IF NOT EXISTS "reviews" (
          "id" TEXT NOT NULL,
          "productId" TEXT NOT NULL,
          "userId" TEXT,
          "userName" TEXT NOT NULL,
          "userEmail" TEXT,
          "rating" INTEGER NOT NULL,
          "title" TEXT,
          "comment" TEXT NOT NULL,
          "verified" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
        );`,

        `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN DEFAULT false;`,
        `UPDATE "users" SET "emailVerified" = true WHERE "emailVerified" IS NULL;`,

        `CREATE TABLE IF NOT EXISTS "email_verification_otps" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "otpHash" TEXT NOT NULL,
          "expiresAt" TIMESTAMP(3) NOT NULL,
          "attempts" INTEGER NOT NULL DEFAULT 0,
          "usedAt" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "email_verification_otps_pkey" PRIMARY KEY ("id")
        );`,

        `CREATE TABLE IF NOT EXISTS "product_lamp_options" (
          "id" TEXT NOT NULL,
          "product_id" TEXT NOT NULL,
          "option_type" TEXT NOT NULL,
          "option_value" TEXT NOT NULL,
          "price_delta" DECIMAL(10,2) NOT NULL DEFAULT 0,
          "is_active" BOOLEAN NOT NULL DEFAULT true,
          "sort_order" INTEGER NOT NULL DEFAULT 0,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "product_lamp_options_pkey" PRIMARY KEY ("id")
        );`
      ];

      for (const statement of ddlStatements) {
        try {
          await rawPrisma.$executeRawUnsafe(statement);
        } catch (err: any) {
          console.warn('[Prisma Schema Sync] Note during DDL statement:', err?.message || err);
        }
      }
      dbSchemaEnsured = true;
      console.log('[Prisma Schema Sync] Successfully executed DDL statements for PostgreSQL schema.');
    })().catch((err) => {
      console.warn('[Prisma Schema Sync] Error during ensureDbSchema:', err);
      dbSchemaPromise = null;
    });
  }

  return dbSchemaPromise;
}

function createModelProxy(modelName: string) {
  const memoryHandler = memoryStore.createModelHandler(modelName);

  return new Proxy({}, {
    get(_target, prop: string) {
      return async (...args: any[]) => {
        if (!hasDatabaseUrl) {
          const fn = (memoryHandler as any)[prop];
          if (typeof fn === 'function') {
            return fn(...args);
          }
          return null;
        }

        await ensureDbSchema();

        const rawModel = (rawPrisma as any)[modelName];
        if (!rawModel || typeof rawModel[prop] !== 'function') {
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
  get(target, prop: string) {
    if (prop === '$connect' || prop === '$disconnect') {
      return async () => {};
    }
    if (prop === '$transaction') {
      return async (cbOrArray: any) => {
        if (!hasDatabaseUrl) {
          if (typeof cbOrArray === 'function') {
            return cbOrArray(prisma);
          }
          if (Array.isArray(cbOrArray)) {
            return Promise.all(cbOrArray);
          }
          return null;
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
