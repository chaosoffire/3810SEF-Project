import { IUser } from "../../../database/model/schema/userSchema";
import * as userRepo from '../../../database/model/user/user.repository';

export async function registerUser(username: string, password: string): Promise<void> {
    const userData: IUser = {
        role: 'user',
        // Let the Mongoose pre-save hook hash the password
        credential: { username, passwordHash: password },
        session: { lastLogoutAt: null },
        orders: [],
    };
    await userRepo.createUser(userData);
}