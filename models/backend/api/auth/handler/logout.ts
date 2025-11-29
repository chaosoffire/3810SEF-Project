import type { Request, Response } from "express";

import { logoutUserByUsername } from "../../../database/model/user/user.repository";
export async function logoutHandler(req: Request, res: Response) {
	const username = (req as any)?.runtime?.username as string | undefined;
	if (!username)
		return res.status(401).json({
			success: false,
			error: "Unauthorized",
		});
	await logoutUserByUsername(username);
	// Clear cookie
	res.cookie?.("x-session", "", {
		httpOnly: true,
		sameSite: "lax",
		path: "/",
		maxAge: 0,
	} as any);
	return res.status(200).json({
		success: true,
	});
}
