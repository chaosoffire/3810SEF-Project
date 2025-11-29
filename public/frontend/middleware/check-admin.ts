import type express from "express";

import { getRole } from "../api/auth/get-role";

export const checkAdmin = async (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction,
) => {
	const role: string = await getRole(req, res);

	if (role === "admin") {
		next();
	} else {
		res.status(401);
	}
};
