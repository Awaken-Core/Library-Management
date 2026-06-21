import { z } from "zod";

export const approveBorrowSchema = z.object({
  returnDate: z.coerce.date({
    required_error: "returnDate is required to approve a borrow request",
  }),
});

// For user requesting to borrow
export const requestBorrowSchema = z.object({
  bookIds: z.array(z.string().uuid()).min(1, "Must borrow at least one book"),
});
