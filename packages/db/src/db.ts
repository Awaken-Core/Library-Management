import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { server_env as env } from "@repo/env";

const connectionString = env.DATABASE_URL;

if (!connectionString && env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({
    connectionString: connectionString || "postgresql://postgres:postgres@localhost:5432/postgres"
});
export const client = new PrismaClient({ adapter });