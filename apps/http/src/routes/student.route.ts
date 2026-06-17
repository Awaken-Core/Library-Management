import { Router } from "express";
import { 
    createStudent, 
    getStudentProfile, 
    updateStudentProfile, 
    changeStudentPassword 
} from "../controllers/student.controller.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";

const studentRouter: Router = Router();

studentRouter.post("/", isAuthenticated, isAdmin, createStudent);
studentRouter.get("/me", isAuthenticated, getStudentProfile);
studentRouter.put("/me", isAuthenticated, updateStudentProfile);
studentRouter.patch("/me/password", isAuthenticated, changeStudentPassword);

export default studentRouter;
