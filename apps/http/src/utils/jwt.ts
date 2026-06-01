import jwt from "jsonwebtoken";
import { server_env as env } from "@repo/env";

export const signToken = (payload: object): string => {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN as any,
    });
};

export const verifyToken = (token: string): any => {
    return jwt.verify(token, env.JWT_SECRET);
};
