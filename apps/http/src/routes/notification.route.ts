import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { 
    getMyNotifications, 
    markRead, 
    markAllRead 
} from "../controllers/notification.controller.js";

const router: Router = Router();

router.use(isAuthenticated);

router.get("/", getMyNotifications);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", markRead);

export default router;
