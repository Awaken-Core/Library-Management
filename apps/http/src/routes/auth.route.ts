import { Router } from "express";
import { checkSetup, createFirstAdmin, login, forgotPassword, resetPassword } from "../controllers/auth.controller.js";

const authRouter: Router = Router();

authRouter.get("/setup-status", checkSetup);
authRouter.post("/setup", createFirstAdmin);
authRouter.post("/login", login);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
