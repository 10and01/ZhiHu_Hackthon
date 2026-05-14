import { PrismaClient } from "@prisma/client";

const DISABLE_DB = process.env.DISABLE_DB === "true";

// ============================================
// 内存 Mock 数据库（无数据库模式）
// 在单个函数实例生命周期内持久化数据
// ============================================

interface MockUser {
  id: string;
  zhihuUid: string;
  screenName: string;
  avatarUrl: string | null;
  profileUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MockWork {
  id: string;
  userId: string;
  title: string;
  sourceUrl: string | null;
  htmlCode: string;
  metaJson: string;
  isPublic: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface MockLike {
  id: string;
  workId: string;
  userId: string;
  createdAt: Date;
}

const memoryStore = {
  users: new Map<string, MockUser>(),
  works: new Map<string, MockWork>(),
  likes: new Map<string, MockLike>(),
};

function generateId() {
  return crypto.randomUUID();
}

const mockPrisma = {
  user: {
    findUnique: async ({ where }: any) => {
      if (where.zhihuUid) {
        return Array.from(memoryStore.users.values()).find(
          (u) => u.zhihuUid === where.zhihuUid
        ) || null;
      }
      if (where.id) {
        return memoryStore.users.get(where.id) || null;
      }
      return null;
    },
    upsert: async ({ where, update, create }: any) => {
      const existing = Array.from(memoryStore.users.values()).find(
        (u) => u.zhihuUid === where.zhihuUid
      );
      if (existing) {
        Object.assign(existing, update, { updatedAt: new Date() });
        return existing;
      }
      const newUser: MockUser = {
        id: generateId(),
        ...create,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.users.set(newUser.id, newUser);
      return newUser;
    },
    findMany: async () => Array.from(memoryStore.users.values()),
  },
  work: {
    findUnique: async ({ where }: any) => {
      const work = memoryStore.works.get(where.id);
      if (!work) return null;
      // 模拟 include 行为
      const user = memoryStore.users.get(work.userId);
      return {
        ...work,
        user: user
          ? { screenName: user.screenName, avatarUrl: user.avatarUrl, zhihuUid: user.zhihuUid }
          : null,
        _count: { likes: Array.from(memoryStore.likes.values()).filter((l) => l.workId === work.id).length },
      };
    },
    findMany: async ({ where, orderBy, include }: any = {}) => {
      let works = Array.from(memoryStore.works.values());
      if (where?.userId) {
        works = works.filter((w) => w.userId === where.userId);
      }
      if (where?.isPublic !== undefined) {
        works = works.filter((w) => w.isPublic === where.isPublic);
      }
      if (orderBy?.createdAt === "desc") {
        works.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      return works.map((work) => {
        const user = memoryStore.users.get(work.userId);
        return {
          ...work,
          user: user
            ? { screenName: user.screenName, avatarUrl: user.avatarUrl, zhihuUid: user.zhihuUid }
            : null,
          _count: { likes: Array.from(memoryStore.likes.values()).filter((l) => l.workId === work.id).length },
        };
      });
    },
    create: async ({ data }: any) => {
      const work: MockWork = {
        id: generateId(),
        ...data,
        isPublic: data.isPublic ?? false,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.works.set(work.id, work);
      return work;
    },
    update: async ({ where, data }: any) => {
      const work = memoryStore.works.get(where.id);
      if (!work) throw new Error("Work not found");
      Object.assign(work, data, { updatedAt: new Date() });
      return work;
    },
    delete: async ({ where }: any) => {
      memoryStore.works.delete(where.id);
      // 同时删除相关点赞
      memoryStore.likes.forEach((like, key) => {
        if (like.workId === where.id) memoryStore.likes.delete(key);
      });
      return {};
    },
    count: async ({ where }: any = {}) => {
      let works = Array.from(memoryStore.works.values());
      if (where?.isPublic !== undefined) {
        works = works.filter((w) => w.isPublic === where.isPublic);
      }
      return works.length;
    },
  },
  like: {
    findUnique: async ({ where }: any) => {
      return (
        Array.from(memoryStore.likes.values()).find(
          (l) => l.workId === where.workId_userId.workId && l.userId === where.workId_userId.userId
        ) || null
      );
    },
    create: async ({ data }: any) => {
      const like: MockLike = {
        id: generateId(),
        ...data,
        createdAt: new Date(),
      };
      memoryStore.likes.set(like.id, like);
      return like;
    },
    delete: async ({ where }: any) => {
      const like = Array.from(memoryStore.likes.values()).find(
        (l) => l.workId === where.workId_userId.workId && l.userId === where.workId_userId.userId
      );
      if (like) memoryStore.likes.delete(like.id);
      return {};
    },
    count: async ({ where }: any = {}) => {
      let likes = Array.from(memoryStore.likes.values());
      if (where?.workId) {
        likes = likes.filter((l) => l.workId === where.workId);
      }
      return likes.length;
    },
  },
  $connect: async () => {},
  $disconnect: async () => {},
} as unknown as PrismaClient;

if (DISABLE_DB) {
  console.warn("[DB] 数据库功能已关闭 (DISABLE_DB=true)，使用内存 Mock 模式（数据在函数实例重启后丢失）");
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = DISABLE_DB
  ? mockPrisma
  : globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production" && !DISABLE_DB) {
  globalForPrisma.prisma = prisma;
}
