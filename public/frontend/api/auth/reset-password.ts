import type express from "express";
import type * as interfaces from "../../Interface/interface";

const apiVersion = process.env.API_VERSION_NO as string | null;

export const resetPassword = async (
	req: express.Request,
	res: express.Response,
) => {
	const response: Response = await fetch(
		`${req.protocol}://${req.get("host")}/api/${apiVersion}/user/change-password`,
		{
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Cookie: req.headers.cookie || "",
			},
			body: JSON.stringify({
				oldPassword: req.body.oldPassword,
				newPassword: req.body.newPassword,
			}),
		},
	);

	if (response.ok) {
		return res.sendStatus(200);
	} else {
		const result: interfaces.resetPasswordError = await response.json();
		return res
			.status(response.status)
			.json({ success: result.success, error: result.error });
	}
};
