import type { Request, Response } from "express";
import { client } from "@repo/db";

export const getAdminStats = async (req: Request, res: Response) => {
    try {
        const [
            totalBooks,
            totalStudents,
            pendingBorrows,
            approvedBorrows,
            overdueCount
        ] = await Promise.all([
            // 1. Total unique book titles
            client.books.count(),
            
            // 2. Total members registered (USER role)
            client.user.count({
                where: { role: "USER" }
            }),
            
            // 3. Pending borrow requests
            client.borrow.count({
                where: { status: "PENDING" }
            }),
            
            // 4. Approved (currently out) borrows
            client.borrow.count({
                where: { status: "APPROVED" }
            }),
            
            // 5. Overdue borrows (approved borrows whose returnDate is past now)
            client.borrow.count({
                where: {
                    status: "APPROVED",
                    returnDate: { lt: new Date() }
                }
            })
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalBooks,
                totalStudents,
                pendingBorrows,
                approvedBorrows,
                overdueCount
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch admin stats",
            error
        });
    }
};
