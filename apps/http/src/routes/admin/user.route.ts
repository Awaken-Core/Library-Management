import { Router } from "express";
import { isAuthenticated, isAdmin } from "../../middlewares/auth.middleware.js";
import {
    getAllUsers,
    toggleUserBanStatus,
    getUserDetails
} from "../../controllers/admin/user.controller.js";

const router: Router = Router();

router.use(isAuthenticated, isAdmin);

router.get("/", getAllUsers);
router.get("/:id", getUserDetails);
router.patch("/:id/ban", toggleUserBanStatus);

export default router;
