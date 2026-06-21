import { Router } from "express";
import { getBooks, getBookById } from "../../controllers/public/book.controller.js";

const router: Router = Router();

router.get("/", getBooks);
router.get("/:id", getBookById);

export default router;
