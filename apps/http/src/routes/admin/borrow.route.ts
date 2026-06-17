import { Router } from "express";
import { isAuthenticated, isAdmin } from "../../middlewares/auth.middleware.js";
import {
    getAllBorrows,
    approveBorrow,
    rejectBorrow,
    returnBorrow
} from "../../controllers/admin/borrow.controller.js";

const router: Router = Router();

// Protect all admin borrow routes
router.use(isAuthenticated, isAdmin);

router.get("/", getAllBorrows);
router.patch("/:id/approve", approveBorrow);
router.patch("/:id/reject", rejectBorrow);
router.post("/:id/return", returnBorrow);

export default router;
