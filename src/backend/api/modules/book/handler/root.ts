import { Request, Response } from 'express';
import { searchBooksByFields, getAllBooks, createBook, updateBookById, hasBookById, getBookById } from '../../../../database/model/book/book.repository';
import { IBook } from '../../../../database/model/schema/bookSchema';



// Sanitize string to prevent MongoDB injection
function sanitizeString(input: string): string {
    // Remove MongoDB operators and special characters that could be used for injection
    const sanitized = input
        .replace(/\$/g, '')  // Remove $ (MongoDB operator prefix)
        .replace(/\{/g, '')  // Remove {
        .replace(/\}/g, '')  // Remove }
        .replace(/\[/g, '')  // Remove [
        .replace(/\]/g, '')  // Remove ]
        .trim();

    return sanitized;
}

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
        genres,
        title: titleQuery,
        author,
        description,
        publishedYear,
        minPrice,
        maxPrice
    } = req.query;

    // Check if there are any query parameters
    const hasQueryParams = genres || titleQuery || author || description || publishedYear || minPrice || maxPrice;

    // If no query parameters, return all books
    if (!hasQueryParams) {
        const books = await getAllBooks();
        return res.json({ success: true, data: books });
    }

    // Validate and sanitize genres
    let genresArray: string[] | undefined = undefined;
    if (genres) {
        try {
            if (Array.isArray(genres)) {
                genresArray = genres.map(String).filter(g => g.length > 0);
            } else {
                // Split by comma and trim whitespace
                genresArray = String(genres).split(',').map(g => g.trim()).filter(g => g.length > 0);
            }

            // Sanitize each genre - remove MongoDB operators
            genresArray = genresArray.map(g => sanitizeString(g));
        } catch (error) {
            return res.status(400).json({ success: false, error: 'Invalid genres format' });
        }
    }

    // Validate and sanitize text fields (title, author, description)
    let validatedTitle: string | undefined = undefined;
    if (titleQuery) {
        try {
            validatedTitle = sanitizeString(String(titleQuery));
            if (validatedTitle.length === 0) {
                return res.status(400).json({ success: false, error: 'Invalid title format' });
            }
        } catch (error) {
            return res.status(400).json({ success: false, error: 'Invalid title format' });
        }
    }

    let validatedAuthor: string | undefined = undefined;
    if (author) {
        try {
            validatedAuthor = sanitizeString(String(author));
            if (validatedAuthor.length === 0) {
                return res.status(400).json({ success: false, error: 'Invalid author format' });
            }
        } catch (error) {
            return res.status(400).json({ success: false, error: 'Invalid author format' });
        }
    }

    let validatedDescription: string | undefined = undefined;
    if (description) {
        try {
            validatedDescription = sanitizeString(String(description));
            if (validatedDescription.length === 0) {
                return res.status(400).json({ success: false, error: 'Invalid description format' });
            }
        } catch (error) {
            return res.status(400).json({ success: false, error: 'Invalid description format' });
        }
    }

    // Validate publishedYear - must be 4 digits
    let validatedPublishedYear: string | undefined = undefined;
    if (publishedYear) {
        const yearStr = String(publishedYear);
        if (!/^\d{4}$/.test(yearStr)) {
            return res.status(400).json({ success: false, error: 'Published year must be a 4-digit number' });
        }
        validatedPublishedYear = yearStr;
    }

    // Validate minPrice - must be a valid number (int or float)
    let validatedMinPrice: number | undefined = undefined;
    if (minPrice !== undefined && minPrice !== null && String(minPrice).trim() !== '') {
        const price = Number(minPrice);
        if (isNaN(price) || price < 0) {
            return res.status(400).json({ success: false, error: 'minPrice must be a valid positive number' });
        }
        validatedMinPrice = price;
    }

    // Validate maxPrice - must be a valid number (int or float)
    let validatedMaxPrice: number | undefined = undefined;
    if (maxPrice !== undefined && maxPrice !== null && String(maxPrice).trim() !== '') {
        const price = Number(maxPrice);
        if (isNaN(price) || price < 0) {
            return res.status(400).json({ success: false, error: 'maxPrice must be a valid positive number' });
        }
        validatedMaxPrice = price;
    }

    // Ensure minPrice is not greater than maxPrice
    if (
        (
            validatedMinPrice !== undefined && validatedMaxPrice !== undefined
        )
        &&
        (
            validatedMinPrice > validatedMaxPrice ||
            validatedMinPrice < 0
        )
    ) {
        return res.status(400).json({ success: false, error: 'minPrice greater than maxPrice or less than 0' });
    }

    // Call the searchBooksByFields function with validated parameters
    const books = await searchBooksByFields({
        genres: genresArray,
        title: validatedTitle,
        author: validatedAuthor,
        description: validatedDescription,
        publishedYear: validatedPublishedYear,
        minPrice: validatedMinPrice,
        maxPrice: validatedMaxPrice
    });

    return res.json({ success: true, data: books });
}


// POST handler - Create a new book
async function POSTrootHandler(req: Request, res: Response) {
    try {
        const {
            genres,
            title,
            author,
            description,
            publishedYear,
            price,
            coverImage
        } = req.body;

        // Validate required field: title
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Title is required and must be a non-empty string' });
        }

        // Sanitize title
        const sanitizedTitle = sanitizeString(title.trim());
        if (sanitizedTitle.length === 0) {
            return res.status(400).json({ success: false, error: 'Title contains only invalid characters' });
        }

        // Validate and sanitize genres (optional)
        let validatedGenres: string[] | undefined = undefined;
        if (genres !== undefined && genres !== null) {
            if (!Array.isArray(genres)) {
                return res.status(400).json({ success: false, error: 'Genres must be an array of strings' });
            }
            validatedGenres = genres
                .filter(g => typeof g === 'string' && g.trim().length > 0)
                .map(g => sanitizeString(g.trim()));
        }

        // Validate and sanitize author (optional)
        let validatedAuthor: string | undefined = undefined;
        if (author !== undefined && author !== null) {
            if (typeof author !== 'string') {
                return res.status(400).json({ success: false, error: 'Author must be a string' });
            }
            validatedAuthor = sanitizeString(author.trim());
        }

        // Validate and sanitize description (optional)
        let validatedDescription: string | undefined = undefined;
        if (description !== undefined && description !== null) {
            if (typeof description !== 'string') {
                return res.status(400).json({ success: false, error: 'Description must be a string' });
            }
            validatedDescription = sanitizeString(description.trim());
        }

        // Validate publishedYear (optional) - must be 4 digits
        let validatedPublishedYear: string | undefined = undefined;
        if (publishedYear !== undefined && publishedYear !== null) {
            const yearStr = String(publishedYear);
            if (!/^\d{4}$/.test(yearStr)) {
                return res.status(400).json({ success: false, error: 'Published year must be a 4-digit number' });
            }
            validatedPublishedYear = yearStr;
        }

        // Validate price (optional) - must be a valid positive number
        let validatedPrice: number | undefined = undefined;
        if (price !== undefined && price !== null) {
            const priceNum = Number(price);
            if (isNaN(priceNum) || priceNum < 0) {
                return res.status(400).json({ success: false, error: 'Price must be a valid positive number' });
            }
            validatedPrice = priceNum;
        }

        // Validate coverImage (optional) - must be a string
        let validatedCoverImage: string | undefined = undefined;
        if (coverImage !== undefined && coverImage !== null) {
            if (typeof coverImage !== 'string') {
                return res.status(400).json({ success: false, error: 'Cover image must be a string' });
            }
            validatedCoverImage = coverImage.trim();
        }

        // Create the book object
        const newBook: IBook = {
            title: sanitizedTitle,
            genres: validatedGenres,
            author: validatedAuthor,
            description: validatedDescription,
            publishedYear: validatedPublishedYear,
            price: validatedPrice,
            coverImage: validatedCoverImage
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