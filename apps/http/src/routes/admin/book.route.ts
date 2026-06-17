import { Router } from "express";
import { isAuthenticated, isAdmin } from "../../middlewares/auth.middleware.js";
import {
    createBook,
    updateBook,
    deleteBook,
    addBookCopies,
    updateCopyStatus,
    getBookById,
} from "../../controllers/admin/book.controller.js";

const booksRouter: Router = Router();

// Protect all admin book routes
booksRouter.use(isAuthenticated, isAdmin);

booksRouter.get("/:id", getBookById);
booksRouter.post("/", createBook);
booksRouter.put("/:id", updateBook);
booksRouter.delete("/:id", deleteBook);

booksRouter.post("/:id/copies", addBookCopies);
booksRouter.patch("/copies/:copyId/status", updateCopyStatus);

export default booksRouter;
