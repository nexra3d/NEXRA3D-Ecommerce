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

// Schema synchronization is safely managed through Prisma migrations.
// Runtime API requests and serverless cold starts must not execute DDL / ALTER TABLE statements.
export function ensureDbSchema(): Promise<void> {
  return Promise.resolve();
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
