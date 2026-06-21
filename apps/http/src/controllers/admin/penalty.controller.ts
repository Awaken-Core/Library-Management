import type { Request, Response } from "express";
import { client } from "@repo/db";

export const getAllPenalties = async (req: Request, res: Response) => {
    try {
        const penalties = await client.penalty.findMany({
            include: {
                user: { select: { id: true, name: true, email: true } },
                borrow: {
                    include: {
                        borrowBooks: {
                            include: {
                                book: { include: { book: true } }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        res.status(200).json({ success: true, data: penalties });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || "Failed to fetch penalties", error });
    }
};

export const payPenalty = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        const penalty = await client.penalty.findUnique({ where: { id } });
        if (!penalty) {
            res.status(404).json({ success: false, message: "Penalty record not found" });
            return;
        }

        const updatedPenalty = await client.penalty.update({
            where: { id },
            data: { paid: true }
        });

        res.status(200).json({ 
            success: true, 
            message: "Penalty marked as paid successfully", 
            data: updatedPenalty 
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || "Failed to process penalty payment", error });
    }
};
