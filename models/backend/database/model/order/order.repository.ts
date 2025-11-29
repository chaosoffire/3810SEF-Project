import type mongoose from "mongoose";

import { MongoDBManager } from "../../mongodb.manager";
import { type IOrder, orderSchema } from "../schema/orderSchema";
import { userSchema } from "../schema/userSchema";
import { USER_COLLECTION } from "../user/user.repository";

export const ORDER_COLLECTION = "orders";
export async function createOrder(
	username: string,
	orderData: {
		books: mongoose.Types.ObjectId[];
		type: "buy" | "refund";
	},
): Promise<void> {
	const orderModel = MongoDBManager.getInstance().getModel(
		ORDER_COLLECTION,
		orderSchema,
	);
	const userModel = MongoDBManager.getInstance().getModel(
		USER_COLLECTION,
		userSchema,
	);

	// Create the order document
	const order = await orderModel.create({
		books: orderData.books,
		type: orderData.type,
	});

	// Update the user document to add this order reference
	await userModel.updateOne(
		{
			"credential.username": username,
		},
		{
			$push: {
				orders: order._id,
			},
		},
	);
}

export async function getOrderById(orderId: string): Promise<
	| (IOrder & {
			_id: string;
	  })
	| null
> {
	const model = MongoDBManager.getInstance().getModel<IOrder>(
		ORDER_COLLECTION,
		orderSchema,
	);
	const order = await model.findById(orderId).lean();
	if (!order) {
		return null;
	}
	const plain = JSON.parse(JSON.stringify(order)) as IOrder & {
		_id: string;
	};
	return plain;
}

export async function deleteOrderById(orderId: string): Promise<true> {
	const model = MongoDBManager.getInstance().getModel(
		ORDER_COLLECTION,
		orderSchema,
	);
	await model.deleteOne({
		_id: orderId,
	});
	// Also need to remove the order reference from any user documents
	const userModel = MongoDBManager.getInstance().getModel(
		USER_COLLECTION,
		userSchema,
	);
	await userModel.updateMany(
		{},
		{
			$pull: {
				orders: orderId,
			},
		},
	);
	return true;
}
