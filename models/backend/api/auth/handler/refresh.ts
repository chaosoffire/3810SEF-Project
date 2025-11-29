import type { Request, Response } from "express";

import { createSessionToken } from "../service/session";

// Assumes authCookieMiddleware already validated the session and set req.runtime.username
export async function refreshCookieHandler(req: Request, res: Response) {
	try {
		const username = req.runtime?.username as string | undefined;
		if (!username) {
			// Should not happen if authCookieMiddleware ran, but keep a safe guard
			return res.status(401).json({
				success: false,
				error: "Unauthorized",
			});
		}

		// Issue a new session token with refreshed TTL
		const newToken = await createSessionToken(username);
		// Mirror login cookie options
		res.cookie?.("x-session", newToken, {
			httpOnly: true,
			sameSite: "lax",
			path: "/",
			maxAge: 30 * 60 * 1000,
		} as any);

		return res.status(200).json({
			success: true,
		});
	} catch (_err) {
		return res.status(500).json({
			success: false,
			error: "Failed to refresh session",
		});
	}
}
