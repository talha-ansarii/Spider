import "server-only";
import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Detect runtimes
const isServer = typeof window === "undefined";
const isEdge = typeof process !== "undefined" && process.env.NEXT_RUNTIME === "edge";

let prismaInstance: PrismaClient | undefined = undefined;

if (isServer && !isEdge) {
	prismaInstance = globalForPrisma.prisma ?? new PrismaClient();
	if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaInstance;
}

// Export prisma. Note: In Edge runtime this will be undefined; consumers must guard usage.
export const prisma = prismaInstance as unknown as PrismaClient;


