import type { IUser } from "../../../database/model/schema/userSchema";

import * as userRepo from "../../../database/model/user/user.repository";

// role only accept 'admin' | 'user' | 'test'
export async function registerUser(
    username: string,
    password: string,
    role: "admin" | "user" | "test",
): Promise<void> {
    const userData: IUser = {
        role,
        // Let the Mongoose pre-save hook hash the password
        credential: {
            username,
            passwordHash: password,
        },
        session: {
            lastLogoutAt: null,
        },
        orders: [],
    };
    await userRepo.createUser(userData);
}
