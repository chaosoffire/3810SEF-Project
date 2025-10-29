import { Request, Response } from 'express';
import { getBookById, updateBookById, deleteBookByIds, hasBookById } from '../../../database/model/book/book.repository';
import { IBook } from '../../../database/model/schema/bookSchema';

// Sanitize string to prevent MongoDB injection
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

// GET /api/:api_version/book/:id
export async function getBookByIdHandler(req: Request, res: Response) {
    try {
        const bookId = req.params.id;

        if (!bookId || bookId.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Book ID is required' });
        }

        const book = await getBookById(bookId);

        if (!book) {
            return res.status(404).json({ success: false, error: 'Book not found' });
        }

        return res.status(200).json({ success: true, data: book });

    } catch (error: any) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'Invalid book ID format' });
        }
        console.error('Error getting book:', error);
        return res.status(500).json({ success: false, error: 'Failed to get book', details: error.message });
    }
}

// PUT /api/:api_version/book/:id
export async function updateBookHandler(req: Request, res: Response) {
    try {
        const bookId = req.params.id;

        if (!bookId || bookId.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Book ID is required' });
        }

        const bookExists = await hasBookById(bookId);
        if (!bookExists) {
            return res.status(404).json({ success: false, error: 'Book not found' });
        }

        const {
            genres,
            title,
            author,
            description,
            publishedYear,
            price,
            coverImage
        } = req.body;

        const updateData: Partial<IBook> = {};

        // Validate and sanitize title
        if (title !== undefined && title !== null) {
            if (typeof title !== 'string' || title.trim().length === 0) {
                return res.status(400).json({ success: false, error: 'Title must be a non-empty string' });
            }
            const sanitizedTitle = sanitizeString(title.trim());
            if (sanitizedTitle.length === 0) {
                return res.status(400).json({ success: false, error: 'Title contains only invalid characters' });
            }
            updateData.title = sanitizedTitle;
        }

        // Validate and sanitize genres
        if (genres !== undefined && genres !== null) {
            if (!Array.isArray(genres)) {
                return res.status(400).json({ success: false, error: 'Genres must be an array of strings' });
            }
            updateData.genres = genres
                .filter(g => typeof g === 'string' && g.trim().length > 0)
                .map(g => sanitizeString(g.trim()));
        }

        // Validate and sanitize author
        if (author !== undefined && author !== null) {
            if (typeof author !== 'string') {
                return res.status(400).json({ success: false, error: 'Author must be a string' });
            }
            updateData.author = sanitizeString(author.trim());
        }

        // Validate and sanitize description
        if (description !== undefined && description !== null) {
            if (typeof description !== 'string') {
                return res.status(400).json({ success: false, error: 'Description must be a string' });
            }
            updateData.description = sanitizeString(description.trim());
        }

        // Validate publishedYear
        if (publishedYear !== undefined && publishedYear !== null) {
            const yearStr = String(publishedYear);
            if (!/^\d{4}$/.test(yearStr)) {
                return res.status(400).json({ success: false, error: 'Published year must be a 4-digit number' });
            }
            updateData.publishedYear = yearStr;
        }

        // Validate price
        if (price !== undefined && price !== null) {
            const priceNum = Number(price);
            if (isNaN(priceNum) || priceNum < 0) {
                return res.status(400).json({ success: false, error: 'Price must be a valid positive number' });
            }
            updateData.price = priceNum;
        }

        // Validate coverImage
        if (coverImage !== undefined && coverImage !== null) {
            if (typeof coverImage !== 'string') {
                return res.status(400).json({ success: false, error: 'Cover image must be a string' });
            }
            updateData.coverImage = coverImage.trim();
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, error: 'No valid fields provided for update' });
        }

        await updateBookById(bookId, updateData);
        const updatedBook = await getBookById(bookId);

        return res.status(200).json({
            success: true,
            message: `Book ${bookId} updated successfully`,
            data: updatedBook
        });

    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, error: 'A book with this title already exists' });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'Invalid book ID format' });
        }
        console.error('Error updating book:', error);
        return res.status(500).json({ success: false, error: 'Failed to update book', details: error.message });
    }
}

// DELETE /api/:api_version/book/:id
export async function deleteBookHandler(req: Request, res: Response) {
    try {
        const bookId = req.params.id;

        if (!bookId || bookId.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Book ID is required' });
        }

        const bookExists = await hasBookById(bookId);
        if (!bookExists) {
            return res.status(404).json({ success: false, error: 'Book not found' });
        }

        await deleteBookByIds([bookId]);

        return res.status(200).json({
            success: true,
            message: `Book ${bookId} deleted successfully`
        });

    } catch (error: any) {
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'Invalid book ID format' });
        }
        console.error('Error deleting book:', error);
        return res.status(500).json({ success: false, error: 'Failed to delete book', details: error.message });
    }
}
