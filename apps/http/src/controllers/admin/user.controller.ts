import type { Request, Response } from "express";
import { client } from "@repo/db";

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await client.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phoneNo: true,
                role: true,
                isBanned: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" }
        });

        res.status(200).json({ success: true, data: users });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || "Failed to fetch users", error });
    }
};

export const getUserDetails = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id as string;
        
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
                borrowsUser: {
                    select: {
                        id: true,
                        status: true,
                        borrowDate: true,
                        returnDate: true,
                        returnedOn: true,
                        penalty: true,
                        borrowBooks: {
                            select: {
                                book: {
                                    select: {
                                        barcode: true,
                                        book: {
                                            select: {
                                                title: true,
                                                author: true,
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    orderBy: { borrowDate: "desc" }
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
        res.status(400).json({ success: false, message: error.message || "Failed to fetch user details", error });
    }
};

export const toggleUserBanStatus = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id as string;

        const user = await client.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.role === "ADMIN") {
            return res.status(400).json({ success: false, message: "Cannot ban an admin user" });
        }

        const updatedUser = await client.user.update({
            where: { id: userId },
            data: { isBanned: !user.isBanned },
            select: { id: true, name: true, email: true, isBanned: true }
        });

        res.status(200).json({ 
            success: true, 
            message: `User ${updatedUser.isBanned ? "banned" : "unbanned"} successfully`, 
            data: updatedUser 
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || "Failed to update user ban status", error });
    }
};
