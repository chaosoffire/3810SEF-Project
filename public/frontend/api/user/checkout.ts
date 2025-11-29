import type express from "express";

import type * as interfaces from "../../Interface/interface";

const apiVersion = process.env.API_VERSION_NO as string | null;

export const checkout = async (req: express.Request, res: express.Response) => {
	const type: string = req.body.type;
	const bookIds: string[] = req.body.bookIds;
	if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
		return res.status(400).json({ message: "Invalid cart data" });
	}

	try {
		const response: Response = await fetch(
			`${req.protocol}://${req.get("host")}/api/${apiVersion}/user/orders`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Cookie: req.headers.cookie || "",
				},
				body: JSON.stringify({
					type: type,
					bookIds: bookIds,
				}),
			},
		);

		if (response.ok) {
			return res.status(200).json({ success: true });
		} else {
			return res
				.status(400)
				.json({ success: false, message: "Order placement failed" });
		}
	} catch (error) {
		console.error("Checkout error:", error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};
