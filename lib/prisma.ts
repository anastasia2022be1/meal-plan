import { PrismaClient } from "@prisma/client";

// Используем globalThis вместо NodeJS.Global
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Создаём единственный экземпляр PrismaClient или используем существующий
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
