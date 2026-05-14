import { PrismaClient } from "@prisma/client";

const DISABLE_DB = process.env.DISABLE_DB === "true";

// Mock Prisma Client（无数据库模式）
const mockPrisma = {
  user: {
    findUnique: async () => null,
    upsert: async () => ({}),
    findMany: async () => [],
  },
  work: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
    count: async () => 0,
  },
  like: {
    findUnique: async () => null,
    create: async () => ({}),
    delete: async () => ({}),
    count: async () => 0,
  },
  $connect: async () => {},
  $disconnect: async () => {},
} as unknown as PrismaClient;

if (DISABLE_DB) {
  console.warn("[DB] 数据库功能已关闭 (DISABLE_DB=true)，使用 Mock 模式");
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = DISABLE_DB
  ? mockPrisma
  : globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production" && !DISABLE_DB) {
  globalForPrisma.prisma = prisma;
}
