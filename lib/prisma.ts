import { PrismaClient } from "@prisma/client";

declare global {
  const prisma: PrismaClient;
}

let prisma: PrismaClient | undefined;

if(process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
    if(!global.prisma) {
        global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
}

export { prisma };