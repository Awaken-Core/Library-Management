import type { Request, Response } from "express";
import { client } from "@repo/db";
import { approveBorrowSchema } from "../../schemas/borrow.schema.js";

// --- Admin Borrowing Management ---

export const getAllBorrows = async (req: Request, res: Response) => {
    try {
        const status = req.query.status as any;
        const borrows = await client.borrow.findMany({
            where: status ? { status } : undefined,
            include: {
                user: { select: { id: true, name: true, email: true } },
                borrowBooks: {
                    include: {
                        book: {
                            include: { book: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        res.status(200).json({ success: true, data: borrows });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || "Failed to fetch borrows", error });
    }
};

export const approveBorrow = async (req: Request, res: Response) => {
    try {
        const borrowId = req.params.id as string;
        const { returnDate } = approveBorrowSchema.parse(req.body);
        const adminId = req.user!.id; // Guaranteed by isAdmin middleware

        const borrow = await client.borrow.findUnique({
            where: { id: borrowId },
            include: { borrowBooks: true }
        });

        if (!borrow) {
            return res.status(404).json({ success: false, message: "Borrow request not found" });
        }

        if (borrow.status !== "PENDING") {
            return res.status(400).json({ success: false, message: `Cannot approve a borrow request that is ${borrow.status}` });
        }

        // Use a transaction to ensure data integrity
        const result = await client.$transaction(async (tx) => {
            // 1. Update the borrow record
            const updatedBorrow = await tx.borrow.update({
                where: { id: borrowId },
                data: {
                    status: "APPROVED",
                    grantedBy: adminId,
                    grantDate: new Date(),
                    returnDate,
                }
            });

            // 2. Mark the physical book copies as BORROWED
            const bookCopyIds = borrow.borrowBooks.map(b => b.bookId);
            await tx.bookCopy.updateMany({
                where: { id: { in: bookCopyIds } },
                data: { status: "BORROWED" }
            });

            // 3. Create a notification for the user
            await tx.notification.create({
                data: {
                    userId: borrow.userId,
                    title: "Borrow Request Approved",
                    message: "Your borrow request has been approved. Please collect your books.",
                    type: "BORROW_APPROVED"
                }
            });

            return updatedBorrow;
        });

        res.status(200).json({ success: true, message: "Borrow request approved successfully", data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || "Failed to approve borrow", error });
    }
};

export const rejectBorrow = async (req: Request, res: Response) => {
    try {
        const borrowId = req.params.id as string;

        const borrow = await client.borrow.findUnique({ where: { id: borrowId } });

        if (!borrow) {
            return res.status(404).json({ success: false, message: "Borrow request not found" });
        }

        if (borrow.status !== "PENDING") {
            return res.status(400).json({ success: false, message: `Cannot reject a borrow request that is ${borrow.status}` });
        }

        const result = await client.$transaction(async (tx) => {
            const updatedBorrow = await tx.borrow.update({
                where: { id: borrowId },
                data: { status: "REJECTED" }
            });

            await tx.notification.create({
                data: {
                    userId: borrow.userId,
                    title: "Borrow Request Rejected",
                    message: "Unfortunately, your recent borrow request was rejected.",
                    type: "BORROW_REJECTED"
                }
            });

            return updatedBorrow;
        });

        res.status(200).json({ success: true, message: "Borrow request rejected", data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || "Failed to reject borrow", error });
    }
};

export const returnBorrow = async (req: Request, res: Response) => {
    try {
        const borrowId = req.params.id as string;

        const borrow = await client.borrow.findUnique({
            where: { id: borrowId },
            include: { borrowBooks: true }
        });

        if (!borrow) {
            return res.status(404).json({ success: false, message: "Borrow record not found" });
        }

        if (borrow.status !== "APPROVED") {
            return res.status(400).json({ success: false, message: `Cannot return a borrow record that is ${borrow.status}` });
        }

        const result = await client.$transaction(async (tx) => {
            const returnedOn = new Date();
            
            // 1. Update the borrow record
            const updatedBorrow = await tx.borrow.update({
                where: { id: borrowId },
                data: {
                    status: "RETURNED",
                    returnedOn,
                }
            });

            // 2. Mark the physical book copies back to AVAILABLE
            const bookCopyIds = borrow.borrowBooks.map(b => b.bookId);
            await tx.bookCopy.updateMany({
                where: { id: { in: bookCopyIds } },
                data: { status: "AVAILABLE" }
            });

            // 3. Calculate Penalty if returned late (e.g., 50 per day late)
            if (borrow.returnDate && returnedOn > borrow.returnDate) {
                const diffTime = Math.abs(returnedOn.getTime() - borrow.returnDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const penaltyAmount = diffDays * 50; // $50 penalty per day late

                await tx.penalty.create({
                    data: {
                        userId: borrow.userId,
                        borrowId: borrow.id,
                        amount: penaltyAmount,
                        reason: `Late return by ${diffDays} days`,
                    }
                });

                await tx.notification.create({
                    data: {
                        userId: borrow.userId,
                        title: "Penalty Applied",
                        message: `You have been fined ₹${penaltyAmount} for a late book return.`,
                        type: "PENALTY_NOTICE"
                    }
                });
            }

            return updatedBorrow;
        });

        res.status(200).json({ success: true, message: "Borrow returned successfully", data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || "Failed to process return", error });
    }
};
