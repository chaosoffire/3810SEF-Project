import { Request, Response } from 'express';
import { searchBooksByFields, getAllBooks, createBook } from '../../../database/model/book/book.repository';
import { IBook } from '../../../database/model/schema/bookSchema';

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
        const books = await getAllBooks();
        return res.json({ success: true, data: books });
    }

    // Values already validated and sanitized by express-validator in router
    const genresArray: string[] | undefined = Array.isArray(genres) ? (genres as any) : undefined;
    const bookIdsArray: string[] | undefined = Array.isArray(bookid) ? (bookid as any) : undefined;
    const validatedTitle: string | undefined = titleQuery ? String(titleQuery) : undefined;
    const validatedAuthor: string | undefined = author ? String(author) : undefined;
    const validatedDescription: string | undefined = description ? String(description) : undefined;
    const validatedPublishedYear: string | undefined = publishedYear ? String(publishedYear) : undefined;
    const validatedMinPrice: number | undefined = (minPrice !== undefined && minPrice !== null && String(minPrice).trim() !== '') ? Number(minPrice) : undefined;
    const validatedMaxPrice: number | undefined = (maxPrice !== undefined && maxPrice !== null && String(maxPrice).trim() !== '') ? Number(maxPrice) : undefined;

    // Pagination & sorting: rely on router validations; just coerce and set defaults
    const validatedStart: number | undefined =
        start !== undefined && start !== null && String(start).trim() !== '' ? Number(start) : undefined;

    const validatedLimit: number =
        limit !== undefined && limit !== null && String(limit).trim() !== '' ? Number(limit) : 0; // 0 = unlimited

    type SortField = 'title' | 'price' | 'publishedYear';
    const validatedSortBy: SortField =
        (sortBy as SortField | undefined) ?? 'title';

    const validatedSortOrder: 'asc' | 'desc' =
        ((sortOrder as string | undefined)?.toLowerCase() as 'asc' | 'desc' | undefined) ?? 'asc';

    // Call the searchBooksByFields function with validated parameters
    const books = await searchBooksByFields({
        genres: genresArray,
        title: validatedTitle,
        author: validatedAuthor,
        description: validatedDescription,
        publishedYear: validatedPublishedYear,
        minPrice: validatedMinPrice,
        maxPrice: validatedMaxPrice,
        bookid: bookIdsArray,
        start: validatedStart,
        limit: validatedLimit,
        sortBy: validatedSortBy,
        sortOrder: validatedSortOrder
    });

    return res.json({ success: true, data: books });
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

        const newBook: IBook = {
            title,
            genres,
            author,
            description,
            publishedYear,
            price,
            coverImage
        };

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