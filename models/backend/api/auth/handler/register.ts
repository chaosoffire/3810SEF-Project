import type { Request, Response } from "express";

import { userExists } from "../../user/service/service";
import { registerUser } from "../service/register";
export async function registerHandler(req: Request, res: Response) {
	const { username, password, admin } = req.body || {};

	if (
		!username ||
		typeof username !== "string" ||
		!password ||
		typeof password !== "string"
	) {
		return res.status(400).json({
			success: false,
			error: "username and password are required",
		});
	}
	// Avoid regex DOS attacks by limiting length first
	if (username.length < 8 || username.length > 32) {
		return res.status(400).json({
			success: false,
			error:
				"Invalid username format, username must be 8-32 characters long, the first character must be a letter, and can only contain letters, numbers, and underscores",
		});
	}
	if (password.length < 12 || password.length > 64) {
		return res.status(400).json({
			success: false,
			error: "Invalid password format, password must be 12-64 characters long",
		});
	}
	if (!username.match(/^[A-Za-z][_A-Za-z0-9]{7,31}$/)) {
		return res.status(400).json({
			success: false,
			error:
				"Invalid username format, first character must be a letter, and can only contain letters, numbers, and underscores",
		});
	}

	if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{12,64}$/)) {
		return res.status(400).json({
			success: false,
			error:
				"Invalid password format, password must include at least one lowercase letter, one uppercase letter and one number",
		});
	}

	try {
		if (await userExists(username)) {
			return res.status(409).json({
				success: false,
				error: "Username already exists",
			});
		}
		const wantsAdmin = admin === true;
		if (wantsAdmin && req.runtime?.role !== "admin") {
			return res.status(403).json({
				success: false,
				error: "Only admins can create admin accounts",
			});
		}

		const role = wantsAdmin ? "admin" : "user";
		await registerUser(username, password, role);
		return res.status(201).json({
			success: true,
		});
	} catch (err: any) {
		console.error("register error:", err?.message || err);
		return res.status(500).json({
			success: false,
			error: "Internal Server Error",
		});
	}
}
