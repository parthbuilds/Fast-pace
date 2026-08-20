import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

// Force Next.js tracing to include the database file in the output bundle
// by referencing it via process.cwd().
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

let databaseUrl = process.env.DATABASE_URL;

// On Vercel / serverless runtime, filesystem is read-only.
// Copy read-only bundled dev.db to /tmp/dev.db to allow writes and prevent SQLite Error code 14.
if (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production') {
  const tempDbPath = '/tmp/dev.db';
  try {
    if (fs.existsSync(dbPath)) {
      if (!fs.existsSync(tempDbPath)) {
        console.log(`[Prisma Init] Copying bundled database from ${dbPath} to ${tempDbPath}`);
        fs.copyFileSync(dbPath, tempDbPath);
      }
      databaseUrl = `file:${tempDbPath}`;
    } else {
      console.warn(`[Prisma Init] SQLite DB file not found at ${dbPath}. A fresh DB will be created.`);
      databaseUrl = `file:${tempDbPath}`;
    }
  } catch (err) {
    console.error('[Prisma Init] Failed to copy SQLite database to /tmp:', err);
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: databaseUrl
      ? {
          db: {
            url: databaseUrl,
          },
        }
      : undefined,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
