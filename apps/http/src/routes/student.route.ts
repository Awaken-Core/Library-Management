import { Router } from "express";
import { createStudent } from "../controllers/student.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const studentRouter: Router = Router();

studentRouter.post("/", authMiddleware, createStudent);

export default studentRouter;
