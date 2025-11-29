import * as userRepo from "../../../database/model/user/user.repository";

export async function userExists(username: string): Promise<boolean> {
	return await userRepo.hasUserByUsername(username);
}
