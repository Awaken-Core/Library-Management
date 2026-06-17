import { Router } from "express";
import { isAuthenticated } from "../../middlewares/auth.middleware.js";
import { requestBorrow, getMyBorrows, cancelBorrowRequest } from "../../controllers/user/borrow.controller.js";

const router: Router = Router();

router.use(isAuthenticated);

router.post("/", requestBorrow);
router.get("/my", getMyBorrows);
router.delete("/:id", cancelBorrowRequest);

export default router;
