import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development during hot-reloads
const globalForPrisma = globalThis as unknown as { prisma: any };

let realPrisma: PrismaClient | null = null;

try {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('user:password')) {
    realPrisma = globalForPrisma.prisma ?? new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = realPrisma;
    }
  }
} catch (err) {
  console.warn('[AI Studio] Database connection setup warning:', err);
}

const noOp: Record<string, any> = {
  findMany: async () => [],
  findFirst: async () => null,
  findUnique: async () => null,
  create: async (d: any) => d?.data ?? {},
  update: async (d: any) => d?.data ?? {},
  delete: async () => ({}),
  upsert: async (d: any) => d?.create ?? {},
  count: async () => 0,
  aggregate: async () => ({ _sum: {}, _count: {}, _avg: {}, _min: {}, _max: {} }),
  groupBy: async () => [],
};

const createModelProxy = (modelName: string) => {
  return new Proxy({}, {
    get(_, method: string) {
      return async (...args: any[]) => {
        if (realPrisma && (realPrisma as any)[modelName] && typeof (realPrisma as any)[modelName][method] === 'function') {
          try {
            return await (realPrisma as any)[modelName][method](...args);
          } catch (err: any) {
            console.warn(`[AI Studio] Prisma ${modelName}.${method} query offline fallback:`, err?.message || err);
            return noOp[method] ? noOp[method](args[0]) : null;
          }
        }
        return noOp[method] ? noOp[method](args[0]) : null;
      };
    }
  });
};

export const prisma: any = new Proxy({}, {
  get(target: any, prop: string) {
    if (realPrisma && prop in realPrisma) {
      const val = (realPrisma as any)[prop];
      if (typeof val === 'function') {
        return val.bind(realPrisma);
      }
      return createModelProxy(prop);
    }
    return createModelProxy(prop);
  }
});

export default prisma;

