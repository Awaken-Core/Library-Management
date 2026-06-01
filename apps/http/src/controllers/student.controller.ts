import { Request, Response } from "express";
import { client } from "@repo/db";
import { hashPassword } from "../utils/password.js";
import { z } from "zod";

const createStudentSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phoneNo: z.string().min(10),
});

export const createStudent = async (req: Request, res: Response) => {
    try {
        const data = createStudentSchema.parse(req.body);
        
        // Check if email or phone already exists
        const existing = await client.user.findFirst({
            where: {
                OR: [{ email: data.email }, { phoneNo: data.phoneNo }],
            },
        });

        if (existing) {
            res.status(409).json({ message: "User with this email or phone number already exists" });
            return;
        }

        // Default password is the phone number
        const hashedPassword = await hashPassword(data.phoneNo);

        const newStudent = await client.user.create({
            data: {
                name: data.name,
                email: data.email,
                phoneNo: data.phoneNo,
                password: hashedPassword,
                role: "USER",
            },
        });

        res.status(201).json({
            message: "Student created successfully",
            student: {
                id: newStudent.id,
                name: newStudent.name,
                email: newStudent.email,
                phoneNo: newStudent.phoneNo,
            },
        });
    } catch (error: any) {
        console.error("createStudent error:", error);
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Invalid input data", errors: error.errors });
            return;
        }
        res.status(500).json({ message: "Internal server error" });
    }
};
