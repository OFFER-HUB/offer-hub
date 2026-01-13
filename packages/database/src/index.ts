import { PrismaClient } from '@prisma/client';

// Singleton instance
export const prisma = new PrismaClient();

// Re-export all Prisma types for convenience
export * from '@prisma/client';
