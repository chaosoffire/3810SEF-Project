import mongoose from "mongoose";
import z from "zod";

import { MongoDBManager } from "../../mongodb.manager";
import { type BookDocument, BookModel, bookSchema } from "../schema/bookSchema";

export const BOOK_COLLECTION = "books";

export async function createBook(book: BookDocument): Promise<true> {
    const model = MongoDBManager.getInstance().getModel<BookDocument>(
        BOOK_COLLECTION,
        bookSchema,
    );
    await model.create(book);
    return true;
}

export async function hasBookById(bookId: string): Promise<boolean> {
    const model = MongoDBManager.getInstance().getModel(
        BOOK_COLLECTION,
        bookSchema,
    );
    const book = await model.findById(bookId).lean();
    return !!book;
}

type SortOrder = "asc" | "desc";

// Only allow sorting by title, publishedYear, or price
const ALLOWED_SORT_FIELDS: Array<keyof BookDocument> = [
    "title",
    "publishedYear",
    "price",
];

export interface BookResult {
    data: BookDocument[];
    count: number;
}

export async function getBooksByField(
    params: BookParam[],
): Promise<BookResult | null> {
    const model = BookModel;
    const searchConfig: Partial<SearchQuery> = {};
    try {
        for (const param of params) {
            await param(searchConfig);
        }
    } catch (error) {
        console.warn("Error building search config:", error);
        console.warn("Skipping invalid search parameters.");
    }
    if (Object.keys(searchConfig).length === 0) {
        const books = await model.find().lean();
        return books
            ? {
                  data: JSON.parse(JSON.stringify(books)),
                  count: books.length,
              }
            : null;
    }

    const andConditions: any[] = [];

    if (searchConfig._id && searchConfig._id.length > 0) {
        andConditions.push({
            _id: {
                $in: searchConfig._id,
            },
        });
    }

    if (searchConfig.title && searchConfig.title.length > 0) {
        const titleOrConditions = searchConfig.title.map((title) => {
            const sanitized = title.replace(/[^0-9A-Za-z]/g, "").trim();
            return {
                title: {
                    $regex: sanitized,
                    $options: "i",
                },
            };
        });
        if (titleOrConditions.length > 0) {
            andConditions.push({
                $or: titleOrConditions,
            });
        }
    }

    if (searchConfig.author && searchConfig.author.length > 0) {
        const authorOrConditions = searchConfig.author.map((author) => {
            const sanitized = author.replace(/[^0-9A-Za-z]/g, "").trim();
            return {
                author: {
                    $regex: sanitized,
                    $options: "i",
                },
            };
        });
        if (authorOrConditions.length > 0) {
            andConditions.push({
                $or: authorOrConditions,
            });
        }
    }

    if (searchConfig.description && searchConfig.description.length > 0) {
        const descriptionOrConditions = searchConfig.description.map((desc) => {
            const sanitized = desc.replace(/[^0-9A-Za-z]/g, "").trim();
            return {
                description: {
                    $regex: sanitized,
                    $options: "i",
                },
            };
        });
        if (descriptionOrConditions.length > 0) {
            andConditions.push({
                $or: descriptionOrConditions,
            });
        }
    }

    if (searchConfig.genres && searchConfig.genres.length > 0) {
        andConditions.push({
            genres: {
                $in: searchConfig.genres,
            },
        });
    }

    if (searchConfig.publishedYear && searchConfig.publishedYear.length > 0) {
        andConditions.push({
            publishedYear: {
                $in: searchConfig.publishedYear,
            },
        });
    }

    if (
        searchConfig.minPrice !== undefined ||
        searchConfig.maxPrice !== undefined
    ) {
        const priceQuery: any = {};
        if (searchConfig.minPrice !== undefined) {
            priceQuery.$gte = searchConfig.minPrice;
        }
        if (searchConfig.maxPrice !== undefined) {
            priceQuery.$lte = searchConfig.maxPrice;
        }
        andConditions.push({
            price: priceQuery,
        });
    }

    const query =
        andConditions.length > 0
            ? {
                  $and: andConditions,
              }
            : {};

    const totalCount = await model.countDocuments(query);

    let mongooseQuery = model.find(query);

    if (searchConfig.sortBy) {
        const sortOrder = searchConfig.sortOrder === "desc" ? -1 : 1;
        mongooseQuery = mongooseQuery.sort({
            [searchConfig.sortBy]: sortOrder,
        });
    }

    if (searchConfig.start !== undefined && searchConfig.start > 0) {
        mongooseQuery = mongooseQuery.skip(searchConfig.start);
    }
    if (searchConfig.limit !== undefined && searchConfig.limit > 0) {
        mongooseQuery = mongooseQuery.limit(searchConfig.limit);
    }

    const books = await mongooseQuery.lean();

    return {
        data: JSON.parse(JSON.stringify(books)),
        count: totalCount,
    };
}
export async function getBookById(
    bookId: string,
): Promise<BookDocument | null> {
    return getBooksByIds([
        bookId,
    ]).then((books) => (books ? books[0] : null));
}

export async function getBooksByIds(
    bookIds: string[],
): Promise<BookDocument[] | null> {
    const model = MongoDBManager.getInstance().getModel<BookDocument>(
        BOOK_COLLECTION,
        bookSchema,
    );
    const books = await model
        .find({
            _id: {
                $in: bookIds,
            },
        })
        .lean();
    return books ? JSON.parse(JSON.stringify(books)) : null;
}

export async function updateBookById(
    bookId: string,
    updateData: Partial<BookDocument>,
): Promise<true> {
    const model = MongoDBManager.getInstance().getModel<BookDocument>(
        BOOK_COLLECTION,
        bookSchema,
    );
    await model.updateOne(
        {
            _id: bookId,
        },
        {
            $set: updateData,
        },
    );
    return true;
}

export async function deleteBookByIds(bookIds: string[]): Promise<true> {
    const model = MongoDBManager.getInstance().getModel(
        BOOK_COLLECTION,
        bookSchema,
    );
    await model.deleteMany({
        _id: {
            $in: bookIds,
        },
    });
    return true;
}

type SearchQuery = {
    _id: mongoose.Types.ObjectId[];
    genres: string[];
    title: string[];
    author: string[];
    description: string[];
    publishedYear: number[];
    minPrice: number;
    maxPrice: number;
    start: number;
    limit: number;
    sortBy: keyof BookDocument;
    sortOrder: SortOrder;
};

type BookParam = (config: Partial<SearchQuery>) => Promise<void>;

export const WithMongoID = (mongoId: string): BookParam => {
    const result = z
        .string()
        .refine((val) => mongoose.Types.ObjectId.isValid(val), {
            message: "Invalid ObjectID",
        })
        .safeParse(mongoId);
    if (!result.success) {
        throw new Error(`Invalid ObjectID: ${mongoId}`);
    }
    const ObjectId = new mongoose.Types.ObjectId(mongoId);

    return async (config: Partial<SearchQuery>) => {
        if (!config._id) {
            config._id = [];
        }
        config._id.push(ObjectId);
    };
};

export const WithTitle = (title: string): BookParam => {
    return async (config: Partial<SearchQuery>) => {
        if (!config.title) {
            config.title = [];
        }
        config.title.push(title);
    };
};

export const WithAuthor = (author: string): BookParam => {
    return async (config: Partial<SearchQuery>) => {
        if (!config.author) {
            config.author = [];
        }
        config.author.push(author);
    };
};

export const WithGenre = (genre: string): BookParam => {
    return async (config: Partial<SearchQuery>) => {
        if (!config.genres) {
            config.genres = [];
        }
        config.genres.push(genre);
    };
};

export const WithDescription = (description: string): BookParam => {
    return async (config: Partial<SearchQuery>) => {
        if (!config.description) {
            config.description = [];
        }
        config.description.push(description);
    };
};

export const WithPublishedYear = (year: number): BookParam => {
    const result = z
        .number()
        .min(1000)
        .max(new Date().getFullYear())
        .safeParse(year);
    if (!result.success) {
        throw new Error(`Invalid published year: ${year}`);
    }
    return async (config: Partial<SearchQuery>) => {
        if (!config.publishedYear) {
            config.publishedYear = [];
        }
        config.publishedYear.push(result.data);
    };
};

export const WithPriceRange = (
    minPrice: number,
    maxPrice: number,
): BookParam => {
    if (minPrice > maxPrice) {
        throw new Error("Invalid price range");
    }
    const result = z.number().min(0).max(maxPrice).safeParse(minPrice);
    if (!result.success) {
        throw new Error(`Invalid price range`);
    }
    return async (config: Partial<SearchQuery>) => {
        config.minPrice = result.data;
        config.maxPrice = maxPrice;
    };
};

export const WithSkip = (skip: number): BookParam => {
    const result = z.number().min(0).safeParse(skip);
    if (!result.success) {
        throw new Error(`Invalid skip: ${skip}`);
    }
    return async (config: Partial<SearchQuery>) => {
        config.start = result.data;
    };
};

export const WithLimit = (limit: number): BookParam => {
    const result = z.number().min(0).safeParse(limit);
    if (!result.success) {
        throw new Error(`Invalid limit: ${limit}`);
    }
    return async (config: Partial<SearchQuery>) => {
        config.limit = result.data;
    };
};

export const WithSort = (
    sortBy: keyof BookDocument,
    sortOrder?: SortOrder,
): BookParam => {
    const result = z.enum(ALLOWED_SORT_FIELDS).safeParse(sortBy);
    if (!result.success) {
        throw new Error(`Invalid sortBy field: ${sortBy}`);
    }
    const order: SortOrder = sortOrder === "desc" ? "desc" : "asc";
    return async (config: Partial<SearchQuery>) => {
        config.sortBy = sortBy;
        config.sortOrder = order;
    };
};
