import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { client } from "@repo/db";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Unauthorized: Missing token" });
            return;
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "Unauthorized: Missing token" });
            return;
        }

        const decoded = verifyToken(token);

        if (!decoded || !decoded.id) {
            res.status(401).json({ message: "Unauthorized: Invalid token" });
            return;
        }

        const user = await client.user.findUnique({
            where: { id: decoded.id },
        });

        if (!user || user.role !== "ADMIN" || user.isBanned) {
            res.status(401).json({ message: "Unauthorized: Insufficient permissions" });
            return;
        }

        (req as any).admin = { id: user.id, email: user.email, name: user.name };
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(401).json({ message: "Unauthorized: Invalid token" });
        return;
    }
};
