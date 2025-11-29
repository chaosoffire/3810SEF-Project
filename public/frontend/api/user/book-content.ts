import type express from "express";

export const bookContent = async (
	req: express.Request,
	res: express.Response,
) => {
	res.status(200).render("book-content", { title: req.query.title });
};
