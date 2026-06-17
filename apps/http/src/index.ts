import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { client } from "@repo/db";
import { server_env as env } from "@repo/env";
import authRouter from "./routes/auth.route.js";
import studentRouter from "./routes/student.route.js";
import adminBookRouter from "./routes/admin/book.route.js";
import adminBorrowRouter from "./routes/admin/borrow.route.js";
import adminUserRouter from "./routes/admin/user.route.js";
import publicBookRouter from "./routes/public/book.route.js";
import userBorrowRouter from "./routes/user/borrow.route.js";
import adminStatsRouter from "./routes/admin/stats.route.js";
import notificationRouter from "./routes/notification.route.js";
import adminPenaltyRouter from "./routes/admin/penalty.route.js";

const app = express();

const allowedOrigins = [env.WEB_URL, env.ADMIN_URL].filter(
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
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        credentials: true,
    }),
);

app.use(express.json())
app.use(cookieParser())

// Public routes
app.use("/api/auth", authRouter);
app.use("/api/books", publicBookRouter);

// User routes (requires login)
app.use("/api/borrows", userBorrowRouter);
app.use("/api/students", studentRouter);
app.use("/api/notifications", notificationRouter);

// Admin routes (requires login + admin role)
app.use("/api/admin/books", adminBookRouter);
app.use("/api/admin/borrows", adminBorrowRouter);
app.use("/api/admin/users", adminUserRouter);
app.use("/api/admin/stats", adminStatsRouter);
app.use("/api/admin/penalties", adminPenaltyRouter);

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
