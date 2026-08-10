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
export async function ensureDbSchema() {
  if (dbSchemaEnsured || !hasDatabaseUrl || !rawPrisma || typeof rawPrisma.$executeRawUnsafe !== 'function') return;
  dbSchemaEnsured = true;
  try {
    await rawPrisma.$executeRawUnsafe(`
      ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "weight" DOUBLE PRECISION;
      ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "length" DOUBLE PRECISION;
      ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "width" DOUBLE PRECISION;
      ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "height" DOUBLE PRECISION;

      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shippingProvider" TEXT;
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "awbNumber" TEXT;
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "trackingNumber" TEXT;
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipmentId" TEXT;
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "estimatedDelivery" TIMESTAMP(3);
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipmentStatus" TEXT;
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "pickupRequested" BOOLEAN DEFAULT false;
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "labelUrl" TEXT;
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "trackingUrl" TEXT;
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "manifestUrl" TEXT;
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "lastTrackingUpdate" TIMESTAMP(3);
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "trackingHistory" JSONB;

      ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "colour" TEXT;
      ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "wattage" TEXT;
      ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "attributes" JSONB;

      ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "skuSnapshot" TEXT;
      ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "selectedColour" TEXT;
      ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "selectedWattage" TEXT;

      CREATE TABLE IF NOT EXISTS "product_images" (
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
      );
    `);
    console.log('[Prisma Schema Sync] Successfully ensured products, orders, product_variants, order_items, and product_images schema exist in PostgreSQL.');
  } catch (err: any) {
    console.warn('[Prisma Schema Sync] Note during schema check:', err?.message || err);
  }
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
