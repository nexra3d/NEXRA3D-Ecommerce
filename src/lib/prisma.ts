import { PrismaClient } from '@prisma/client';
import { memoryStore } from './memoryDb.js';

const globalForPrisma = globalThis as unknown as { prisma: any };

const rawPrisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = rawPrisma;
}

let forceMemoryMode = false;

function createModelProxy(modelName: string) {
  const memoryHandler = memoryStore.createModelHandler(modelName);

  return new Proxy({}, {
    get(_target, prop: string) {
      return async (...args: any[]) => {
        if (forceMemoryMode) {
          const fn = (memoryHandler as any)[prop];
          if (typeof fn === 'function') {
            return fn(...args);
          }
          return null;
        }

        try {
          const rawModel = (rawPrisma as any)[modelName];
          if (rawModel && typeof rawModel[prop] === 'function') {
            return await rawModel[prop](...args);
          }
        } catch (err: any) {
          const msg = String(err?.message || err || '');
          if (
            msg.includes('Can\'t reach database server') ||
            msg.includes('PrismaClientInitializationError') ||
            msg.includes('P1001') ||
            msg.includes('P1002') ||
            msg.includes('ECONNREFUSED')
          ) {
            forceMemoryMode = true;
          }
          const fn = (memoryHandler as any)[prop];
          if (typeof fn === 'function') {
            return fn(...args);
          }
        }
        const fn = (memoryHandler as any)[prop];
        if (typeof fn === 'function') {
          return fn(...args);
        }
        return null;
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
        if (typeof cbOrArray === 'function') {
          return cbOrArray(prisma);
        }
        if (Array.isArray(cbOrArray)) {
          return Promise.all(cbOrArray);
        }
        return null;
      };
    }
    if (prop in target && typeof (target as any)[prop] === 'function') {
      return (...args: any[]) => {
        try {
          return (target as any)[prop](...args);
        } catch (err) {
          return null;
        }
      };
    }
    return createModelProxy(prop);
  }
}) as PrismaClient;

export default prisma;
