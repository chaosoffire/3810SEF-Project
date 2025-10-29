import { Schema, model } from 'mongoose';

// Book Collection schema definition
export const bookSchema = new Schema({
    
    // The "_id": "Object_id" is automatically managed by Mongoose [1]

    "genres": {
        // Example genres include "Horror" and "Thriller" [1]
        type: [String] 
    },

    "title": {
        // Example title: "A Beautiful Foo Title" [1]
        type: String,
        required: true,
        unique: true
    },

    "author": {
        // Example author: "Foo Bar" [1]
        type: String
    },

    "description": {
        // Stores a detailed description of the book [1]
        type: String
    },

    "publishedYear": {
        // Stores the published year, e.g., "2023" [1]
        type: String
    },

    "price": {
        // Stores the price of the book, e.g., 19.99 [1]
        type: Number
    },

    "coverImage": {
        // Stores the Base64 encoded cover image string [1]
        type: String
    }
    
    // Note: The source structure for the Book Collection [1] does not explicitly list
    // creation or update timestamps, unlike the discussion regarding the Order model [2] 
    // and User collection [3, 4].
});

// Add indexes for better query performance
bookSchema.index({ title: 1 });
bookSchema.index({ author: 1 });
bookSchema.index({ genres: 1 });
bookSchema.index({ price: 1 });
bookSchema.index({ publishedYear: 1 });

export interface IBook {
    genres?: string[];
    title: string;
    author?: string;
    description?: string;
    publishedYear?: string;
    price?: number;
    coverImage?: string;
}