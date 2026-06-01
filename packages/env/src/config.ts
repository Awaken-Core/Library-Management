import { z } from "zod";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

export const ServerEnvSchema = z.object({
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string(),
    JWT_EXPIRES_IN: z.string().default("24h"),
    PORT: z.string(),
    NODE_ENV: z.string().optional().default("development"),
    APP_URL: z.string().url(),
    WEB_URL: z.string().url(),
    ADMIN_URL: z.string().url(),
    SERVER_URL: z.string().url(),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;
export const server_env = ServerEnvSchema.parse(process.env);
