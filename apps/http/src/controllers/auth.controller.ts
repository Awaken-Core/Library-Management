import { Request, Response } from "express";
import { client } from "@repo/db";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { server_env as env } from "@repo/env";


const setupSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phoneNo: z.string().min(10),
    password: z.string().min(6),
});

export const checkSetup = async (req: Request, res: Response) => {
    try {
        const adminCount = await client.user.count({
            where: { role: "ADMIN" },
        });
        res.json({ adminExists: adminCount > 0 });
    } catch (error) {
        console.error("checkSetup error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createFirstAdmin = async (req: Request, res: Response) => {
    try {
        const adminCount = await client.user.count({
            where: { role: "ADMIN" },
        });

        if (adminCount > 0) {
            res.status(403).json({ message: "Admin already exists. Setup locked." });
            return;
        }

        const data = setupSchema.parse(req.body);
        const hashedPassword = await hashPassword(data.password);

        const newAdmin = await client.user.create({
            data: {
                name: data.name,
                email: data.email,
                phoneNo: data.phoneNo,
                password: hashedPassword,
                role: "ADMIN",
            },
        });

        const token = signToken({ id: newAdmin.id, role: newAdmin.role });

        res.status(201).json({
            token,
            admin: {
                id: newAdmin.id,
                name: newAdmin.name,
                email: newAdmin.email,
            },
        });
    } catch (error: any) {
        console.error("createFirstAdmin error:", error);
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Invalid input data", errors: error.errors });
            return;
        }
        if (error.code === 'P2002') {
            res.status(409).json({ message: "Email or phone number already in use" });
            return;
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const login = async (req: Request, res: Response) => {
    try {
        const data = loginSchema.parse(req.body);

        const user = await client.user.findFirst({
            where: { email: data.email, isBanned: false },
        });

        if (!user) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        const isMatch = await comparePassword(data.password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        const token = signToken({ id: user.id, role: user.role });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error: any) {
        console.error("login error:", error);
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Invalid input data", errors: error.errors });
            return;
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

const forgotPasswordSchema = z.object({
    email: z.string().email(),
    phoneNo: z.string().min(10),
});

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const data = forgotPasswordSchema.parse(req.body);

        const user = await client.user.findFirst({
            where: { email: data.email, phoneNo: data.phoneNo, isBanned: false },
        });

        if (!user) {
            res.status(404).json({ success: false, message: "User not found with matching email and phone number" });
            return;
        }

        // Generate a temporary reset token (valid for 15 minutes)
        const resetToken = jwt.sign({ id: user.id, reset: true }, env.JWT_SECRET, { expiresIn: "15m" });
        
        console.log("=========================================");
        console.log("PASSWORD RESET TOKEN:", resetToken);
        console.log("=========================================");

        res.json({ success: true, message: "Verification successful.", resetToken });
    } catch (error: any) {
        console.error("forgotPassword error:", error);
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, message: "Invalid input data", errors: error.errors });
            return;
        }
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const resetPasswordSchema = z.object({
    resetToken: z.string(),
    newPassword: z.string().min(6),
});

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const data = resetPasswordSchema.parse(req.body);

        // Verify token
        let decoded: any;
        try {
            decoded = jwt.verify(data.resetToken, env.JWT_SECRET);
        } catch (err) {
            res.status(401).json({ success: false, message: "Invalid or expired reset token" });
            return;
        }

        if (!decoded || !decoded.reset || !decoded.id) {
            res.status(401).json({ success: false, message: "Invalid token payload" });
            return;
        }

        const hashedPassword = await hashPassword(data.newPassword);

        await client.user.update({
            where: { id: decoded.id },
            data: { password: hashedPassword, passwordChangedAt: new Date() },
        });

        res.json({ success: true, message: "Password updated successfully" });
    } catch (error: any) {
        console.error("resetPassword error:", error);
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, message: "Invalid input data", errors: error.errors });
            return;
        }
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
