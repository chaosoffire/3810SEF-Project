import { Request, Response } from 'express';
import { searchBooksByFields, updateBookById, deleteBookByIds, hasBookById, getBookById } from '../../../database/model/book/book.repository';
import { IBook } from '../../../database/model/schema/bookSchema';

// GET /api/:api_version/book/:id
export async function getBookByIdHandler(req: Request, res: Response) {
    try {
        const bookId = req.params.id;

        // ID format is validated by router middleware; reuse search logic
        const books = await searchBooksByFields({ bookid: [bookId], limit: 1 });
        const book = books?.data && books.data[0];

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

        // Rely on router validators; assign directly
        if (title !== undefined) updateData.title = title;
        if (Array.isArray(genres)) updateData.genres = genres;
        if (author !== undefined) updateData.author = author;
        if (description !== undefined) updateData.description = description;
        if (publishedYear !== undefined) updateData.publishedYear = String(publishedYear);
        if (price !== undefined) updateData.price = Number(price);
        if (coverImage !== undefined) updateData.coverImage = String(coverImage);

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
