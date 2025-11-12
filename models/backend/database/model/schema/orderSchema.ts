// import mongoose from 'mongoose';
import mongoose, { Schema } from "mongoose";

export const orderSchema = new Schema(
    {
        // "books" field is an array of references to documents in the Book collection
        books: {
            type: [
                mongoose.Types.ObjectId,
            ],
            // Assuming there is a separate 'Book' model defined elsewhere
            ref: "Book",
            required: true,
        },

        // "type" field specifies the nature of the transaction
        type: {
            type: String,
            required: true,
            // The type can be "buy" or "refund" [1]
            enum: [
                "buy",
                "refund",
            ],
        },
    },
    {
        timestamps: true,
    },
);

export interface IOrder {
    books: mongoose.Types.ObjectId[];
    type: "buy" | "refund";
}
