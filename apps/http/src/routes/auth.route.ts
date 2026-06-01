import { Router } from "express";
import { checkSetup, createFirstAdmin, login } from "../controllers/auth.controller.js";

const authRouter: Router = Router();

authRouter.get("/setup-status", checkSetup);
authRouter.post("/setup", createFirstAdmin);
authRouter.post("/login", login);

export default authRouter;
