import express from 'express';
import { query, body, param, validationResult } from 'express-validator';
import { ensureAdmin } from '../auth/roles.middleware';
import { authCookieMiddleware } from '../auth/cookie.middleware';
import { rootHandler } from './handler/root';
import { getBookByIdHandler, updateBookHandler, deleteBookHandler } from './handler/id';

export const bookRouter = express.Router({ mergeParams: true });
const handleValidationErrors = (req: express.Request, res: express.Response, next: express.NextFunction) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
	}
	next();
};

// Book functionalities

// List books by parameters
// GET /api/:api_version/book
bookRouter.get(
	'/',
	authCookieMiddleware,
	// Optional filters
	query('genres').optional().isString(),
	query('title').optional().isString(),
	query('author').optional().isString(),
	query('description').optional().isString(),
	query('publishedYear').optional().matches(/^\d{4}$/),
	query('minPrice').optional().isFloat({ min: 0 }),
	query('maxPrice').optional().isFloat({ min: 0 }),
	// Pagination & sorting (optional)
	query('page').optional().isInt({ min: 1 }),
	query('limit').optional().isInt({ min: 1, max: 100 }),
	query('sortBy').optional().isIn(['title', 'author', 'price', 'publishedYear']),
	query('sortOrder').optional().isIn(['asc', 'desc']),
	handleValidationErrors,
	rootHandler
);

// Create a new book
// POST /api/:api_version/book
bookRouter.post(
	'/',
	authCookieMiddleware,
	ensureAdmin,
	body('title').isString().notEmpty(),
	body('genres').optional().isArray(),
	body('genres.*').optional().isString(),
	body('author').optional().isString(),
	body('description').optional().isString(),
	body('publishedYear').optional().matches(/^\d{4}$/),
	body('price').optional().isFloat({ min: 0 }),
	body('coverImage').optional().isString(),
	handleValidationErrors,
	rootHandler
);

// Get book by ID
// GET /api/:api_version/book/:id
bookRouter.get(
	'/:id',
	authCookieMiddleware,
	param('id').isString().notEmpty(),
	handleValidationErrors,
	getBookByIdHandler
);

// Update book by ID
// PUT /api/:api_version/book/:id
bookRouter.put(
	'/:id',
	authCookieMiddleware,
	ensureAdmin,
	param('id').isString().notEmpty(),
	// Same validations as POST but optional
	body('title').optional().isString().notEmpty(),
	body('genres').optional().isArray(),
	body('genres.*').optional().isString(),
	body('author').optional().isString(),
	body('description').optional().isString(),
	body('publishedYear').optional().matches(/^\d{4}$/),
	body('price').optional().isFloat({ min: 0 }),
	body('coverImage').optional().isString(),
	handleValidationErrors,
	updateBookHandler
);

// Delete book by ID
// DELETE /api/:api_version/book/:id
bookRouter.delete(
	'/:id',
	authCookieMiddleware,
	ensureAdmin,
	param('id').isString().notEmpty(),
	handleValidationErrors,
	deleteBookHandler
);