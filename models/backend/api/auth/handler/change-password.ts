import bcrypt from "bcryptjs";
import type { Request, Response } from "express";

import * as userRepo from "../../../database/model/user/user.repository";
export async function changePasswordHandler(req: Request, res: Response) {
	try {
		const { oldPassword, newPassword } = req.body || {};
		const username = req.runtime?.username as string | undefined;

		if (!username)
			return res.status(401).json({
				success: false,
				error: "Unauthorized",
			});
		if (typeof oldPassword !== "string" || typeof newPassword !== "string") {
			return res.status(400).json({
				success: false,
				error: "oldPassword and newPassword are required",
			});
		}
		if (!oldPassword.length || !newPassword.length) {
			return res.status(400).json({
				success: false,
				error: "Passwords cannot be empty",
			});
		}
		if (newPassword.length < 12 || newPassword.length > 64) {
			return res.status(400).json({
				success: false,
				error: "New password must be 12-64 characters long",
			});
		}
		if (oldPassword === newPassword) {
			return res.status(400).json({
				success: false,
				error: "New password must be different from old password",
			});
		}

		const userRaw = await userRepo.getUserByUsername(username);
		type DbUserCredential = {
			credential?: {
				passwordHash?: string;
			};
		} | null;
		const user = userRaw as unknown as DbUserCredential;
		const passwordHash = user?.credential?.passwordHash;
		if (!passwordHash) {
			return res.status(404).json({
				success: false,
				error: "User not found",
			});
		}

		const ok = await bcrypt.compare(oldPassword, passwordHash);
		if (!ok) {
			return res.status(400).json({
				success: false,
				error: "Old password is incorrect",
			});
		}

		const salt = await bcrypt.genSalt(10);
		const newHash = await bcrypt.hash(newPassword, salt);
		await userRepo.updateUserPasswordHashByUsername(username, newHash);

		// Optionally, consider invalidating existing sessions by updating lastLogoutAt
		// await userRepo.logoutUserByUsername(username);

		return res.status(200).json({
			success: true,
		});
	} catch (err: any) {
		console.error("change-password error:", err?.message || err);
		return res.status(500).json({
			success: false,
			error: "Internal Server Error",
		});
	}
}
