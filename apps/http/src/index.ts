import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { client } from "@repo/db";
import { server_env as env } from "@repo/env";

const app = express();

const allowedOrigins = [env.WEB_URL,].filter(
    (origin): origin is string => Boolean(origin),
);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }
            callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    }),
);

app.use(express.json())
app.use(cookieParser())

app.get('/health', (_req, res) => {
    res.send("All Good!")
})

const PORT = Number.parseInt(env.PORT || "5000", 10);

app.listen(PORT, async () => {
    await client.$connect();
    console.log("Database connected successfully");
    console.log(`Server is running on ${PORT}`);
    console.log(`Allowed CORS origins: ${allowedOrigins.join(", ")}`);
});
