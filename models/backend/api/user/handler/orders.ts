import type { Request, Response } from "express";

import mongoose from "mongoose";

import {
	createOrder,
	getOrderById,
} from "../../../database/model/order/order.repository";
import * as userRepo from "../../../database/model/user/user.repository";
import { getUserOwnBooks } from "../service/getUserOwnBooks";

interface OrderRequest {
	type: "buy" | "refund";
	bookIds: string[];
}

export async function ordersHandler(req: Request, res: Response) {
	if (req.method === "GET") {
		return GETordersHandler(req, res);
	}
	if (req.method === "POST") {
		return POSTordersHandler(req, res);
	}
	return res.status(405).json({
		success: false,
		error: "Method Not Allowed",
	});
}

export async function orderDetailHandler(req: Request, res: Response) {
	const username = req.runtime?.username as string | undefined;
	const role = req.runtime?.role;
	const orderId = req.params.id;

	if (!username) {
		return res.status(401).json({
			success: false,
			error: "Unauthorized",
		});
	}

	try {
		if (role !== "admin") {
			const orders = await userRepo.getUserOrdersByUsername(username);
			const ownsOrder =
				Array.isArray(orders) && orders.some((id) => String(id) === orderId);
			if (!ownsOrder) {
				return res.status(404).json({
					success: false,
					error: "Order not found",
				});
			}
		}

		const order = await getOrderById(orderId);
		if (!order) {
			return res.status(404).json({
				success: false,
				error: "Order not found",
			});
		}

		const orderResponse = {
			id: String(order._id),
			type: order.type,
			books: Array.isArray(order.books)
				? order.books.map((book) => String(book))
				: [],
			createdAt: (order as any).createdAt ?? null,
			updatedAt: (order as any).updatedAt ?? null,
		};

		return res.status(200).json({
			success: true,
			order: orderResponse,
		});
	} catch (err: any) {
		console.error("orderDetailHandler error:", err?.message || err);
		return res.status(500).json({
			success: false,
			error: "Internal Server Error",
		});
	}
}

async function GETordersHandler(req: Request, res: Response) {
	const username = req.runtime?.username as string | undefined;
	if (!username) {
		return res.status(401).json({
			success: false,
			error: "Unauthorized",
		});
	}
	try {
		const orders = await userRepo.getUserOrdersByUsername(username);
		return res.status(200).json({
			success: true,
			orders,
		});
	} catch (err: any) {
		console.error("GETordersHandler error:", err?.message || err);
		return res.status(500).json({
			success: false,
			error: "Internal Server Error",
		});
	}
}

async function POSTordersHandler(req: Request, res: Response) {
	const username = req.runtime?.username as string | undefined;

	if (!username) {
		return res.status(401).json({
			success: false,
			error: "Unauthorized",
		});
	}

	// Validate request body
	const { type, bookIds } = req.body as OrderRequest;

	if (!type || !bookIds) {
		return res.status(400).json({
			success: false,
			error: "Missing required fields: type and bookIds are required",
		});
	}

	if (!["buy", "refund"].includes(type)) {
		return res.status(400).json({
			success: false,
			error: 'Invalid type: must be either "buy" or "refund"',
		});
	}

	if (!Array.isArray(bookIds) || bookIds.length === 0) {
		return res.status(400).json({
			success: false,
			error: "bookIds must be a non-empty array",
		});
	}

	try {
		// Use HashMap to ensure all book IDs are unique (only contain once)
		const uniqueBookIds = [...new Set(bookIds)];

		// Validate all book IDs are valid ObjectIds
		const validObjectIds: mongoose.Types.ObjectId[] = [];
		for (const bookId of uniqueBookIds) {
			if (!mongoose.Types.ObjectId.isValid(bookId)) {
				return res.status(400).json({
					success: false,
					error: `Invalid book ID format: ${bookId}`,
				});
			}
			validObjectIds.push(new mongoose.Types.ObjectId(bookId));
		}

		// Get user's current owned books
		const ownedBooks = await getUserOwnBooks(username);
		const ownedBookSet = new Set(ownedBooks);

		// Check logic based on type
		if (type === "refund") {
			// Check if all books in the request exist in user's owned books
			const notOwnedBooks = uniqueBookIds.filter(
				(bookId) => !ownedBookSet.has(bookId),
			);

			if (notOwnedBooks.length > 0) {
				return res.status(400).json({
					success: false,
					error: "Book cannot be refunded as not owned",
					details: {
						notOwnedBooks,
					},
				});
			}

			// All books are owned, proceed with refund
			await createOrder(username, {
				books: validObjectIds,
				type: "refund",
			});
			return res.status(200).json({
				success: true,
				message: "Refund order created successfully",
			});
		} else if (type === "buy") {
			// Check if any books in the request already exist in user's owned books
			const alreadyOwnedBooks = uniqueBookIds.filter((bookId) =>
				ownedBookSet.has(bookId),
			);

			if (alreadyOwnedBooks.length > 0) {
				return res.status(400).json({
					success: false,
					error: "Book cannot be bought twice",
					details: {
						alreadyOwnedBooks,
					},
				});
			}

			// None of the books are owned, proceed with purchase
			await createOrder(username, {
				books: validObjectIds,
				type: "buy",
			});
			return res.status(200).json({
				success: true,
				message: "Buy order created successfully",
			});
		}
	} catch (err: any) {
		console.error("Orders handler error:", err?.message || err);
		return res.status(500).json({
			success: false,
			error: "Internal Server Error",
		});
	}
}
