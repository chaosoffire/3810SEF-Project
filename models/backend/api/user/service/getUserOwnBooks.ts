// import { Results } from "../../model/constent.ts.bak";
import { MongoDBManager } from '../../../database/mongodb.manager';
import { USER_COLLECTION } from "../../../database/model/user/user.repository";
import { userSchema } from '../../../database/model/schema/userSchema';
import { orderSchema } from "../../../database/model/schema/orderSchema";

export async function getUserOwnBooks(username: string): Promise<string[]> {

    // 1. Fetch the user document to get the list of order references
    // The user document contains the 'orders' array which holds sorted references to the Order collection [2].
    const user = await MongoDBManager.getInstance().getModel(USER_COLLECTION, userSchema).findOne({ 'credential.username': username }).select('orders').lean();
    const orderModel = MongoDBManager.getInstance().getModel('orders', orderSchema);
    if (!user || (Array.isArray(user) ? user.length === 0 : !user.orders || user.orders.length === 0)) {
        // If the user does not exist or has no orders, return an empty array.
        return [];
    }

    const orderIds = Array.isArray(user) ? [] : user.orders;

    // 2. Aggregation Pipeline on the Order Collection
    const netInventory = await orderModel.aggregate([
        // A. Match: Filter only the orders referenced by the user [2]
        {
            $match: {
                _id: { $in: orderIds }
            }
        },

        // B. Unwind: Deconstruct the 'books' array so each individual item is processed [1]
        {
            $unwind: "$books"
        },

        // C. Project/Calculate Weight: Assign a numeric value based on the transaction 'type' [1]
        {
            $project: {
                _id: 0,
                itemId: "$books", // The Book Object ID
                // If type is "buy", value is 1. If type is "refund", value is -1 [1].
                contribution: {
                    $cond: {
                        if: { $eq: ["$type", "buy"] },
                        then: 1,
                        else: -1
                    }
                }
            }
        },

        // D. Group: Group by the Book ID and sum the contributions
        {
            $group: {
                _id: "$itemId", // Grouping key is the Book ID (matches projected field)
                netCount: { $sum: "$contribution" }
            }
        },

        // E. Filter: Keep only books where the net count is greater than 0 (i.e., books currently held)
        {
            $match: {
                netCount: { $gt: 0 }
            }
        },

        // F. Final Projection: Return only the Book ID
        {
            $project: {
                _id: "$_id"
            }
        }
    ]);

    // 3. Format the results as a simple array of IDs
    // The aggregation returns an array of objects like [{ _id: "Item_Object_id_A" }]
    return netInventory.map(item => item._id.toString());
}