import type { Request, Response } from "express";
import { client } from "@repo/db";
import { requestBorrowSchema } from "../../schemas/borrow.schema.js";

export const requestBorrow = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { bookIds } = requestBorrowSchema.parse(req.body);

        // Fetch available copies for the requested books
        const availableCopies = await client.bookCopy.findMany({
            where: {
                bookId: { in: bookIds },
                status: "AVAILABLE"
            }
        });

        // Map to ensure we have at least one copy per requested book
        const copiesByBookId = availableCopies.reduce((acc, copy) => {
            const arr = acc[copy.bookId] || [];
            arr.push(copy);
            acc[copy.bookId] = arr;
            return acc;
        }, {} as Record<string, typeof availableCopies>);

        const selectedCopyIds: string[] = [];
        const missingBooks: string[] = [];

        for (const bookId of bookIds) {
            if (copiesByBookId[bookId] && copiesByBookId[bookId].length > 0) {
                // Select one copy for this book
                const copy = copiesByBookId[bookId].pop()!;
                selectedCopyIds.push(copy.id);
            } else {
                missingBooks.push(bookId);
            }
        }

        if (missingBooks.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Some requested books are currently out of stock", 
                missingBooks 
            });
        }

        const result = await client.$transaction(async (tx) => {
            // 1. Create Borrow Record
            const borrow = await tx.borrow.create({
                data: {
                    userId,
                    status: "PENDING",
                    borrowBooks: {
                        create: selectedCopyIds.map(copyId => ({ bookId: copyId }))
                    }
                }
            });

            // Note: We don't mark copies as BORROWED yet, because it's only PENDING.
            // If another user borrows them first, the admin approval step might fail,
            // or the admin can re-assign copies. In a perfect system, we might reserve them (e.g. status RESERVED).
            // But for this schema, we just create the request.

            return borrow;
        });

        res.status(201).json({ success: true, message: "Borrow request submitted successfully", data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || "Failed to request borrow", error });
    }
};

export const getMyBorrows = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;

        const borrows = await client.borrow.findMany({
            where: { userId },
            include: {
                borrowBooks: {
                    include: {
                        book: { include: { book: true } }
                    }
                },
                penalty: true
            },
            orderBy: { createdAt: "desc" }
        });

        res.status(200).json({ success: true, data: borrows });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || "Failed to fetch borrow history", error });
    }
};

export const cancelBorrowRequest = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const userId = req.user!.id;

        const borrow = await client.borrow.findUnique({
            where: { id },
            include: { borrowBooks: true }
        });

        if (!borrow) {
            res.status(404).json({ success: false, message: "Borrow request not found" });
            return;
        }

        if (borrow.userId !== userId) {
            res.status(403).json({ success: false, message: "Forbidden: You cannot cancel another member's request" });
            return;
        }

        if (borrow.status !== "PENDING") {
            res.status(400).json({ success: false, message: `Cannot cancel a request that is ${borrow.status}` });
            return;
        }

        await client.$transaction(async (tx) => {
            // Delete association table entries first
            await tx.borrowItems.deleteMany({
                where: { borrowId: id }
            });
            // Delete the main borrow request
            await tx.borrow.delete({
                where: { id }
            });
        });

        res.status(200).json({ success: true, message: "Borrow request cancelled successfully" });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || "Failed to cancel request", error });
    }
};
