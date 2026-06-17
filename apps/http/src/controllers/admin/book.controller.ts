import type { Request, Response } from "express";
import { client } from "@repo/db";
import {
    createBookSchema,
    updateBookSchema,
    addBookCopiesSchema,
    updateCopyStatusSchema,
} from "../../schemas/book.schema.js";

// --- Book Management ---

export const createBook = async (req: Request, res: Response) => {
    try {
        const validatedData = createBookSchema.parse(req.body);

        const existingBook = await client.books.findUnique({
            where: { isbn: validatedData.isbn },
        });

        if (existingBook) {
            return res.status(400).json({ success: false, message: "Book with this ISBN already exists" });
        }

        const newBook = await client.books.create({
            data: validatedData,
        });

        res.status(201).json({ success: true, message: "Book created successfully", data: newBook });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || "Invalid input data", error });
    }
};

export const updateBook = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const validatedData = updateBookSchema.parse(req.body);

        const updatedBook = await client.books.update({
            where: { id },
            data: validatedData,
        });

        res.status(200).json({ success: true, message: "Book updated successfully", data: updatedBook });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || "Failed to update book", error });
    }
};

export const deleteBook = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        await client.books.delete({
            where: { id },
        });

        res.status(200).json({ success: true, message: "Book deleted successfully" });
    } catch (error: any) {
        res.status(400).json({ success: false, message: "Failed to delete book", error });
    }
};

// --- Book Copies Management ---

export const addBookCopies = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string; // book id
        const { barcodes } = addBookCopiesSchema.parse(req.body);

        const book = await client.books.findUnique({ where: { id } });
        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }

        // Check if any barcode already exists
        const existingCopies = await client.bookCopy.findMany({
            where: { barcode: { in: barcodes } },
        });

        if (existingCopies.length > 0) {
            const existingBarcodes = existingCopies.map((c) => c.barcode).join(", ");
            return res.status(400).json({
                success: false,
                message: `The following barcodes already exist: ${existingBarcodes}`,
            });
        }

        const dataToInsert = barcodes.map((barcode) => ({
            bookId: id,
            barcode,
            status: "AVAILABLE" as const,
        }));

        const result = await client.bookCopy.createMany({
            data: dataToInsert,
        });

        res.status(201).json({
            success: true,
            message: `Successfully added ${result.count} copies`,
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || "Failed to add copies", error });
    }
};

export const updateCopyStatus = async (req: Request, res: Response) => {
    try {
        const copyId = req.params.copyId as string;
        const { status } = updateCopyStatusSchema.parse(req.body);

        const updatedCopy = await client.bookCopy.update({
            where: { id: copyId },
            data: { status },
        });

        res.status(200).json({
            success: true,
            message: "Copy status updated successfully",
            data: updatedCopy,
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || "Failed to update copy status", error });
    }
};

export const getBookById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const book = await client.books.findUnique({
            where: { id },
            include: {
                bookCopies: {
                    orderBy: { createdAt: "desc" }
                }
            }
        });

        if (!book) {
            res.status(404).json({ success: false, message: "Book not found" });
            return;
        }

        res.status(200).json({ success: true, data: book });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || "Failed to fetch book details", error });
    }
};
