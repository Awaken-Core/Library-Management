import { Request, Response } from "express";
import { client } from "@repo/db";
import { hashPassword } from "../utils/password.js";
import { z } from "zod";

const createStudentSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phoneNo: z.string().min(10),
});

export const createStudent = async (req: Request, res: Response) => {
    try {
        const data = createStudentSchema.parse(req.body);
        
        // Check if email or phone already exists
        const existing = await client.user.findFirst({
            where: {
                OR: [{ email: data.email }, { phoneNo: data.phoneNo }],
            },
        });

        if (existing) {
            res.status(409).json({ message: "User with this email or phone number already exists" });
            return;
        }

        // Default password is the phone number
        const hashedPassword = await hashPassword(data.phoneNo);

        const newStudent = await client.user.create({
            data: {
                name: data.name,
                email: data.email,
                phoneNo: data.phoneNo,
                password: hashedPassword,
                role: "USER",
            },
        });

        res.status(201).json({
            message: "Student created successfully",
            student: {
                id: newStudent.id,
                name: newStudent.name,
                email: newStudent.email,
                phoneNo: newStudent.phoneNo,
            },
        });
    } catch (error: any) {
        console.error("createStudent error:", error);
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Invalid input data", errors: error.errors });
            return;
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getStudentProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const user = await client.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNo: true,
                role: true,
                isBanned: true,
                createdAt: true,
                subscriptions: {
                    where: {
                        endDate: { gte: new Date() }
                    },
                    orderBy: { endDate: "desc" },
                    take: 1
                },
                penalties: {
                    where: { paid: false },
                    select: {
                        id: true,
                        amount: true,
                        reason: true,
                        createdAt: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error: any) {
        console.error("getStudentProfile error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const updateProfileSchema = z.object({
    name: z.string().min(2),
    phoneNo: z.string().min(10),
});

export const updateStudentProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const data = updateProfileSchema.parse(req.body);

        // Check if phone number is already used by someone else
        const existing = await client.user.findFirst({
            where: {
                phoneNo: data.phoneNo,
                id: { not: userId }
            }
        });

        if (existing) {
            res.status(409).json({ success: false, message: "Phone number already in use by another user" });
            return;
        }

        const updatedUser = await client.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                phoneNo: data.phoneNo
            },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNo: true
            }
        });

        res.status(200).json({ success: true, message: "Profile updated successfully", data: updatedUser });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, message: "Invalid input data", errors: error.errors });
            return;
        }
        res.status(500).json({ success: false, message: error.message || "Failed to update profile", error });
    }
};

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
});

export const changeStudentPassword = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

        const user = await client.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        // Verify current password
        const { comparePassword } = await import("../utils/password.js");
        const isMatch = await comparePassword(currentPassword, user.password);

        if (!isMatch) {
            res.status(401).json({ success: false, message: "Incorrect current password" });
            return;
        }

        // Hash and save new password
        const hashedPassword = await hashPassword(newPassword);
        await client.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, message: "Invalid input data", errors: error.errors });
            return;
        }
        res.status(500).json({ success: false, message: error.message || "Failed to change password", error });
    }
};

