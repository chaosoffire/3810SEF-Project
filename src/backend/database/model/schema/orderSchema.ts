// import mongoose from 'mongoose';
import mongoose, { Schema, model } from 'mongoose';

export const orderSchema = new Schema({
    // "books" field is an array of references to documents in the Book collection
    books: {
        type: [mongoose.Types.ObjectId],
        // Assuming there is a separate 'Book' model defined elsewhere
        ref: 'Book', 
        required: true
    },
    
    // "type" field specifies the nature of the transaction
    type: {
        type: String,
        required: true,
        // The type can be "buy" or "refund" [1]
        enum: ['buy', 'refund'] 
    }
}, {
    // Standard Mongoose options often used for tracking creation time, 
    // although 'createdAt' tracking is explicitly mentioned for the User collection [2], 
    // it is generally beneficial for Order tracking as well.
    timestamps: true
});

export interface IOrder {
    books: mongoose.Types.ObjectId[];
    type: 'buy' | 'refund';
}
