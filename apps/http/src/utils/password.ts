import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export const hashPassword = async (plain: string): Promise<string> => {
    return await bcrypt.hash(plain, SALT_ROUNDS);
};

export const comparePassword = async (plain: string, hashed: string): Promise<boolean> => {
    return await bcrypt.compare(plain, hashed);
};
