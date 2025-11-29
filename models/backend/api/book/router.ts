import express from "express";
import { body, param, query, validationResult } from "express-validator";
import { Types } from "mongoose";

import { authCookieMiddleware } from "../auth/service/cookie.middleware";
import { ensureAdmin } from "../auth/service/roles.middleware";
import {
	deleteBookHandler,
	getBookByIdHandler,
	updateBookHandler,
} from "./handler/id";
import { rootHandler } from "./handler/root";

export const bookRouter = express.Router({
	mergeParams: true,
});
const handleValidationErrors = (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction,
) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({
			success: false,
			error: "Validation failed",
			details: errors.array(),
		});
	}
	next();
};

// Book functionalities

// List books by parameters
// GET /api/:api_version/book
bookRouter.get(
	"/",
	authCookieMiddleware,
	// Optional filters
	query("bookid")
		.optional()
		.isString()
		.trim()
		.customSanitizer((v) =>
			String(v)
				.split(",")
				.map((s: string) => s.trim())
				.filter((s: string) => s.length > 0),
		)
		.custom((arr: unknown) => {
			if (!Array.isArray(arr)) return false;
			return arr.every(
				(id) => typeof id === "string" && Types.ObjectId.isValid(id),
			);
		})
		.withMessage(
			"bookid must be a comma-separated list of valid Mongo ObjectIds",
		),
	query("genres")
		.optional()
		.isString()
		.trim()
		.customSanitizer((v) =>
			String(v)
				.split(",")
				.map((s: string) => s.trim())
				.filter((s: string) => s.length > 0),
		)
		.custom(
			(arr: unknown) =>
				Array.isArray(arr) && arr.every((s) => typeof s === "string"),
		),
	query("title").optional().isString().trim().blacklist("$[]{}"),
	query("author").optional().isString().trim().blacklist("$[]{}"),
	query("description").optional().isString().trim().blacklist("$[]{}"),
	query("publishedYear")
		.optional()
		.trim()
		.matches(/^\d{4}$/),
	query("minPrice")
		.optional()
		.isFloat({
			min: 0,
		})
		.toFloat(),
	query("maxPrice")
		.optional()
		.isFloat({
			min: 0,
		})
		.toFloat()
		.custom((max, { req }) => {
			const minRaw = (req.query as any).minPrice;
			if (
				minRaw === undefined ||
				minRaw === null ||
				String(minRaw).trim() === ""
			)
				return true;
			const min = Number(minRaw);
			if (Number.isNaN(min)) return true; // min handled by its own validator
			return max >= min;
		})
		.withMessage("maxPrice must be greater than or equal to minPrice"),
	// Pagination & sorting (optional)
	query("start")
		.optional()
		.isInt({
			min: 0,
		})
		.toInt(),
	query("limit")
		.optional()
		.isInt({
			min: 0,
			max: 100,
		})
		.toInt(),
	query("sortBy").optional().isIn(["title", "price", "publishedYear"]),
	query("sortOrder").optional().isIn(["asc", "desc"]),
	handleValidationErrors,
	rootHandler,
);

// Create a new book
// POST /api/:api_version/book
bookRouter.post(
	"/",
	authCookieMiddleware,
	ensureAdmin,
	// Required title
	body("title")
		.isString()
		.trim()
		.notEmpty()
		.blacklist("$[]{}"),
	// Optional genres as array of non-empty strings
	body("genres")
		.optional()
		.isArray()
		.customSanitizer((arr) =>
			Array.isArray(arr)
				? arr
						.map((g: any) => String(g))
						.map((s: string) => s.trim())
						.filter((s: string) => s.length > 0)
				: arr,
		),
	body("genres.*").optional().isString().trim().blacklist("$[]{}"),
	// Optional text fields
	body("author")
		.optional()
		.isString()
		.trim()
		.blacklist("$[]{}"),
	body("description").optional().isString().trim().blacklist("$[]{}"),
	// Optional year and price
	body("publishedYear")
		.optional()
		.trim()
		.matches(/^\d{4}$/),
	body("price")
		.optional()
		.isFloat({
			min: 0,
		})
		.toFloat(),
	// Optional cover image string
	body("coverImage")
		.optional()
		.isString()
		.trim(),
	handleValidationErrors,
	rootHandler,
);

// Get book by ID
// GET /api/:api_version/book/:id
bookRouter.get(
	"/:id",
	authCookieMiddleware,
	param("id").isMongoId(),
	handleValidationErrors,
	getBookByIdHandler,
);

// Update book by ID
// PUT /api/:api_version/book/:id
bookRouter.put(
	"/:id",
	authCookieMiddleware,
	ensureAdmin,
	param("id").isMongoId(),
	// Same validations as POST but optional
	body("title")
		.optional()
		.isString()
		.trim()
		.notEmpty()
		.blacklist("$[]{}"),
	body("genres")
		.optional()
		.isArray()
		.customSanitizer((arr) =>
			Array.isArray(arr)
				? arr
						.map((g: any) => String(g))
						.map((s: string) => s.trim())
						.filter((s: string) => s.length > 0)
				: arr,
		),
	body("genres.*").optional().isString().trim().blacklist("$[]{}"),
	body("author").optional().isString().trim().blacklist("$[]{}"),
	body("description").optional().isString().trim().blacklist("$[]{}"),
	body("publishedYear")
		.optional()
		.trim()
		.matches(/^\d{4}$/),
	body("price")
		.optional()
		.isFloat({
			min: 0,
		})
		.toFloat(),
	body("coverImage").optional().isString().trim(),
	handleValidationErrors,
	updateBookHandler,
);

// Delete book by ID
// DELETE /api/:api_version/book/:id
bookRouter.delete(
	"/:id",
	authCookieMiddleware,
	ensureAdmin,
	param("id").isString().notEmpty(),
	handleValidationErrors,
	deleteBookHandler,
);
