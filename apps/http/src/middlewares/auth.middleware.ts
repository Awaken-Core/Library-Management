import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { client } from "@repo/db";

// Extend Express Request object locally
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                role: string;
            };
        }
    }
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        let token = "";

        // Check header or cookies
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1] as string;
        } else if (req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            res.status(401).json({ success: false, message: "Unauthorized: Missing token" });
            return;
        }

        const decoded = verifyToken(token);

        if (!decoded || !decoded.id) {
            res.status(401).json({ success: false, message: "Unauthorized: Invalid token payload" });
            return;
        }

        const user = await client.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, name: true, role: true, isBanned: true }
        });

        if (!user) {
            res.status(401).json({ success: false, message: "Unauthorized: User not found" });
            return;
        }

        if (user.isBanned) {
            res.status(403).json({ success: false, message: "Forbidden: Account is banned" });
            return;
        }

        // Attach user to request
        req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        };

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" });
    }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: "Unauthorized: User not authenticated" });
        return;
    }

    if (req.user.role !== "ADMIN") {
        res.status(403).json({ success: false, message: "Forbidden: Admin access required" });
        return;
    }

    next();
};
