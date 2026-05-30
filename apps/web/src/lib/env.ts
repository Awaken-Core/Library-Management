import { z } from "zod";

export const EnvSchema = z.object({
    NEXT_PUBLIC_API_BASE: z.string().url(),
    NEXT_PUBLIC_WEB_URL: z.string().url(),
    NEXT_PUBLIC_ADMIN_URL: z.string().url(),
});

export type WebEnv = z.infer<typeof EnvSchema>;

export const web_env = EnvSchema.parse({
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
    NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL,
    NEXT_PUBLIC_ADMIN_URL: process.env.NEXT_PUBLIC_ADMIN_URL,
});
