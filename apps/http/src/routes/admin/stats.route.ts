import { Router } from "express";
import { isAuthenticated, isAdmin } from "../../middlewares/auth.middleware.js";
import { getAdminStats } from "../../controllers/admin/stats.controller.js";

const router: Router = Router();

router.use(isAuthenticated, isAdmin);

router.get("/", getAdminStats);

export default router;
