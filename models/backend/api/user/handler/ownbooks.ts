import type { Request, Response } from "express";

import { getUserOwnBooks } from "../service/getUserOwnBooks";

export async function ownbooksHandler(req: Request, res: Response) {
	const username = req.runtime?.username as string | undefined;
	if (!username) {
		return res.status(401).json({
			success: false,
			error: "Unauthorized",
		});
	}
	try {
		const books = await getUserOwnBooks(username);
		return res.status(200).json({
			success: true,
			books,
		});
	} catch (err: any) {
		console.error("getUserOwnBooks error:", err?.message || err);
		return res.status(500).json({
			success: false,
			error: "Internal Server Error",
		});
	}
}
