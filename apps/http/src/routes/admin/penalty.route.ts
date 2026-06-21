import { Router } from "express";
import { isAuthenticated, isAdmin } from "../../middlewares/auth.middleware.js";
import { getAllPenalties, payPenalty } from "../../controllers/admin/penalty.controller.js";

const router: Router = Router();

router.use(isAuthenticated, isAdmin);

router.get("/", getAllPenalties);
router.patch("/:id/pay", payPenalty);

export default router;
