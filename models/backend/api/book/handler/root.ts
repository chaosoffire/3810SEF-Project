import { Request, Response } from 'express';
import {
    createBook,
    getBooksByField,
    WithMongoID,
    WithTitle,
    WithAuthor,
    WithDescription,
    WithGenre,
    WithPublishedYear,
    WithPriceRange,
    WithSkip,
    WithLimit,
    WithSort
} from '../../../database/model/book/book.repository';
import { BookDocument } from '../../../database/model/schema/bookSchema';
import z from 'zod';

/*
 * DEPRECATED: Legacy sanitizeString helper remains unused; validation middleware already covers these cases.
 * Keeping the implementation for reference without shipping it.
function sanitizeString(input: string): string {
    const sanitized = input
        .replace(/\$/g, '')
        .replace(/\{/g, '')
        .replace(/\}/g, '')
        .replace(/\[/g, '')
        .replace(/\]/g, '')
        .trim();

    return sanitized;
}
*/

export async function rootHandler(req: Request, res: Response) {
    if (req.method === 'GET') {
        return GETrootHandler(req, res);
    }
    if (req.method === 'POST') {
        return POSTrootHandler(req, res);
    }
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}


// Helper function to split comma-separated strings and trim elements
function parseCommaSeparatedString(value: any): string[] {
    if (!value) return [];

    // If already an array, join and split to handle arrays with comma-separated elements
    const stringValue = Array.isArray(value) ? value.join(',') : String(value);

    return stringValue
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
}

// Get all books or search for books based on query parameters
async function GETrootHandler(req: Request, res: Response) {
    const {
        bookid,
        genres,
        title: titleQuery,
        author,
        description,
        publishedYear,
        minPrice,
        maxPrice,
        start,
        limit,
        sortBy,
        sortOrder
    } = req.query;

    // Check if there are any query parameters
    const hasQueryParams = bookid || genres || titleQuery || author || description || publishedYear || minPrice || maxPrice || start || limit || sortBy || sortOrder;

    // If no query parameters, return all books
    if (!hasQueryParams) {
        const books = await getBooksByField([]);
        return res.json({ success: true, data: books });
    }

    // Build the query parameters array
    const params: ReturnType<typeof WithMongoID | typeof WithTitle | typeof WithAuthor | typeof WithDescription | typeof WithGenre | typeof WithPublishedYear | typeof WithPriceRange | typeof WithSkip | typeof WithLimit | typeof WithSort>[] = [];

    // Process book IDs - split by comma and trim
    if (bookid) {
        const bookIdsArray = parseCommaSeparatedString(bookid);

        for (const id of bookIdsArray) {
            try {
                params.push(WithMongoID(id));
            } catch (error) {
                // Skip invalid book IDs silently
                console.warn(`Skipping invalid book ID: ${id}`);
            }
        }
    }

    // Process titles - split by comma and trim
    if (titleQuery) {
        const titleArray = parseCommaSeparatedString(titleQuery);

        for (const title of titleArray) {
            try {
                params.push(WithTitle(title));
            } catch (error) {
                // Skip invalid titles silently
                console.warn(`Skipping invalid title: ${title}`);
            }
        }
    }

    // Process authors - split by comma and trim
    if (author) {
        const authorArray = parseCommaSeparatedString(author);

        for (const auth of authorArray) {
            try {
                params.push(WithAuthor(auth));
            } catch (error) {
                // Skip invalid authors silently
                console.warn(`Skipping invalid author: ${auth}`);
            }
        }
    }

    // Process descriptions - split by comma and trim
    if (description) {
        const descArray = parseCommaSeparatedString(description);

        for (const desc of descArray) {
            params.push(WithDescription(desc));
        }
    }

    // Process genres - split by comma and trim
    if (genres) {
        const genresArray = parseCommaSeparatedString(genres);

        for (const genre of genresArray) {
            params.push(WithGenre(genre));
        }
    }

    // Process published year - split by comma and trim (support multiple years)
    if (publishedYear) {
        const yearArray = parseCommaSeparatedString(publishedYear);
        for (const year of yearArray) {
            const result = z
                .number()
                .int()
                .min(1000)
                .max(new Date().getFullYear())
                .safeParse(year);
            if (!result.success) {
                continue;
            }
            params.push(WithPublishedYear(result.data));
        }
    }

    // Process price range
    if (minPrice !== undefined || maxPrice !== undefined) {
        try {
            const minPriceValue = minPrice !== undefined ? Number(minPrice) : 0;
            const maxPriceValue = maxPrice !== undefined ? Number(maxPrice) : Number.MAX_SAFE_INTEGER;

            if (!isNaN(minPriceValue) && !isNaN(maxPriceValue)) {
                params.push(WithPriceRange(minPriceValue, maxPriceValue));
            }
        } catch (error) {
            // Skip invalid price range silently
            console.warn(`Skipping invalid price range`);
        }
    }

    // Process pagination (skip)
    if (start !== undefined) {
        try {
            const startValue = Number(start);
            if (!isNaN(startValue) && startValue >= 0) {
                params.push(WithSkip(startValue));
            }
        } catch (error) {
            // Skip invalid start value silently
            console.warn(`Skipping invalid start value`);
        }
    }

    // Process pagination (limit)
    if (limit !== undefined) {
        try {
            const limitValue = Number(limit);
            if (!isNaN(limitValue) && limitValue > 0) {
                params.push(WithLimit(limitValue));
            }
        } catch (error) {
            // Skip invalid limit value silently
            console.warn(`Skipping invalid limit value`);
        }
    }

    // Process sorting
    if (sortBy) {
        try {
            const sortByStr = String(sortBy);
            const sortOrderStr = sortOrder ? String(sortOrder).toLowerCase() as 'asc' | 'desc' : 'asc';

            if (['title', 'price', 'publishedYear'].includes(sortByStr)) {
                params.push(WithSort(sortByStr as 'title' | 'price' | 'publishedYear', sortOrderStr));
            }
        } catch (error) {
            // Skip invalid sort parameters silently
            console.warn(`Skipping invalid sort parameters`);
        }
    }

    // Call getBooksByField with the built parameters
    const result = await getBooksByField(params);

    if (!result) {
        return res.status(404).json({ success: false, error: 'No books found' });
    }
    return res.json({ success: true, data: result.data, count: result.count });
}


// POST handler - Create a new book
async function POSTrootHandler(req: Request, res: Response) {
    try {
        // Values are already validated/sanitized by express-validator in router
        const { title, genres, author, description, publishedYear, price, coverImage } = req.body as {
            title: string;
            genres?: string[];
            author?: string;
            description?: string;
            publishedYear?: string;
            price?: number;
            coverImage?: string;
        };

        const newBook = {
            title,
            genres: genres || [],
            author,
            description,
            publishedYear,
            price,
            coverImage
        } as BookDocument;

        // Call createBook from repository
        await createBook(newBook);

        return res.status(201).json({
            success: true,
            message: 'Book created successfully',
            data: newBook
        });

    } catch (error: any) {
        // Handle duplicate title error (unique constraint)
        if (error.code === 11000) {
            return res.status(409).json({ success: false, error: 'A book with this title already exists' });
        }

        return res.status(500).json({ success: false, error: 'Failed to create book', details: error.message });
    }
}