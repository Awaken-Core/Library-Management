import { api } from "../lib/api";
import type { Admin } from "../store/auth.store";

export type LoginPayload = { email: string; password: string };
export type SetupPayload = { name: string; email: string; phoneNo: string; password: string };
export type ForgotPasswordPayload = { email: string; phoneNo: string };
export type ResetPasswordPayload = { resetToken: string; newPassword: string };

export type AuthResponse = {
    user?: Admin;
    admin?: Admin;
    token: string;
};

export const getSetupStatus = async () => {
    const { data } = await api.get<{ adminExists: boolean }>("/auth/setup-status");
    return data;
};

export const loginAdmin = async (payload: LoginPayload) => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
};

export const setupAdmin = async (payload: SetupPayload) => {
    const { data } = await api.post<AuthResponse>("/auth/setup", payload);
    return data;
};

export const verifyForgotPassword = async (payload: ForgotPasswordPayload) => {
    const { data } = await api.post<{ resetToken?: string }>("/auth/forgot-password", payload);
    return data;
};

export const resetPassword = async (payload: ResetPasswordPayload) => {
    const { data } = await api.post<{ message?: string }>("/auth/reset-password", payload);
    return data;
};
