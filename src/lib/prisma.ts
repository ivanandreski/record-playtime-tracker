import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

// Prevent multiple Prisma instances during Vite HMR in dev
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
		log: dev ? ['query', 'error', 'warn'] : ['error'],
	});

if (dev) globalForPrisma.prisma = prisma;
