import type { Request, Response } from "express";
import { client } from "@repo/db";

export const getBooks = async (req: Request, res: Response) => {
    try {
        const { search, page = "1", limit = "10" } = req.query;
        
        const pageNumber = parseInt(page as string, 10);
        const pageSize = parseInt(limit as string, 10);
        const skip = (pageNumber - 1) * pageSize;

        const whereClause = search ? {
            OR: [
                { title: { contains: search as string, mode: "insensitive" as const } },
                { author: { contains: search as string, mode: "insensitive" as const } }
            ]
        } : {};

        const [books, total] = await Promise.all([
            client.books.findMany({
                where: whereClause,
                skip,
                take: pageSize,
                include: {
                    _count: {
                        select: {
                            bookCopies: { where: { status: "AVAILABLE" } }
                        }
                    }
                },
                orderBy: { createdAt: "desc" }
            }),
            client.books.count({ where: whereClause })
        ]);

        res.status(200).json({
            success: true,
            data: books.map(book => ({
                ...book,
                availableCopies: book._count.bookCopies
            })),
            meta: {
                total,
                page: pageNumber,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize)
            }
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || "Failed to fetch books", error });
    }
};

export const getBookById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const book = await client.books.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        bookCopies: { where: { status: "AVAILABLE" } }
                    }
                }
            }
        });

        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }

        res.status(200).json({ 
            success: true, 
            data: {
                ...book,
                availableCopies: book._count.bookCopies
            } 
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || "Failed to fetch book", error });
    }
};
