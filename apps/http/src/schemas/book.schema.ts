import { z } from "zod";

export const createBookSchema = z.object({
  isbn: z.string().min(10).max(13),
  title: z.string().min(1),
  author: z.string().min(1),
  description: z.string().optional(),
  publisher: z.string().optional(),
  edition: z.string().optional(),
  language: z.string().optional(),
  publishedAt: z.coerce.date(), // Coerce string to Date object
});

export const updateBookSchema = createBookSchema.partial();

export const addBookCopiesSchema = z.object({
  barcodes: z.array(z.string().min(1)).min(1, "At least one barcode must be provided"),
});

export const updateCopyStatusSchema = z.object({
  status: z.enum(["AVAILABLE", "BORROWED", "LOST", "DAMAGED"]),
});
