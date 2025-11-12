import type mongoose from "mongoose";

import { model, Schema } from "mongoose";

const BOOK_COLLECTION = "books";

// Book Collection schema definition
export const bookSchema = new Schema({
    // The "_id": "Object_id" is automatically managed by Mongoose [1]

    genres: {
        // Example genres include "Horror" and "Thriller" [1]
        type: [
            String,
        ],
    },

    title: {
        // Example title: "A Beautiful Foo Title" [1]
        type: String,
        required: true,
        unique: true,
    },

    author: {
        // Example author: "Foo Bar" [1]
        type: String,
    },

    description: {
        // Stores a detailed description of the book [1]
        type: String,
    },

    publishedYear: {
        // Stores the published year, e.g., "2023" [1]
        type: String,
    },

    price: {
        // Stores the price of the book, e.g., 19.99 [1]
        type: Number,
    },

    coverImage: {
        // Stores the Base64 encoded cover image string [1]
        type: String,
    },
});

// Add indexes for better query performance
bookSchema.index({
    author: 1,
});
bookSchema.index({
    genres: 1,
});
bookSchema.index({
    price: 1,
});
bookSchema.index({
    publishedYear: 1,
});

const BookModel = model(BOOK_COLLECTION, bookSchema);
type BookDocument = mongoose.InferSchemaType<typeof bookSchema> &
    mongoose.Document;

export type { BookDocument };

// export interface BookDocument extends BookDocument { }

export { BookModel };
