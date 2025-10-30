import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, param } from 'express-validator';
import { authCookieMiddleware } from '../auth/service/cookie.middleware';
import { registerHandler } from '../auth/handler/register';
import { loginHandler } from '../auth/handler/login';
import { logoutHandler } from '../auth/handler/logout';
import { changePasswordHandler } from '../auth/handler/change-password';
import { ordersHandler, orderDetailHandler } from './handler/orders';
import { ownbooksHandler } from './handler/ownbooks';
import { getUserByUsername } from '../../database/model/user/user.repository';
import { ensureAdmin } from '../auth/service/roles.middleware';
import { deleteOrderById } from '../../database/model/order/order.repository';
import { refreshCookieHandler } from '../auth/handler/refresh';
import { handleValidationErrors } from '../auth/service/handle.validation.error';
import { requireAdminForAdminCreation } from '../auth/service/roles.middleware';

export const userRouter = express.Router({ mergeParams: true });

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth logics
// POST /api/:api_version/user/register
userRouter.post(
    '/register',
    authLimiter,
    body('username').isString().isLength({ min: 8, max: 32 }),
    body('password').isString().isLength({ min: 12, max: 64 }),
    body('admin').optional().isBoolean().toBoolean(),
    handleValidationErrors,
    requireAdminForAdminCreation,
    registerHandler
);

// POST /api/:api_version/user/login
userRouter.post(
    '/login',
    authLimiter,
    body('username').isString().notEmpty(),
    body('password').isString().notEmpty(),
    handleValidationErrors,
    loginHandler
);

// POST /api/:api_version/user/logout
userRouter.post('/logout', authCookieMiddleware, logoutHandler);

// PUT /api/:api_version/user/change-password
userRouter.put(
    '/change-password',
    authCookieMiddleware,
    body('oldPassword').isString().notEmpty(),
    body('newPassword').isString().isLength({ min: 12, max: 64 }),
    handleValidationErrors,
    changePasswordHandler
);

userRouter.post(
    '/refresh-cookie',
    authCookieMiddleware,
    refreshCookieHandler
);

// GET /api/:api_version/user/isAdmin
userRouter.get('/isAdmin', authCookieMiddleware, async (req, res) => {
    try {
        const username = req.runtime?.username;
        
        if (!username) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const user = await getUserByUsername(username);
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const userJson = JSON.parse(JSON.stringify(user));
        const isAdmin = userJson.role === 'admin';

        return res.status(200).json({ success: true, isAdmin });

    } catch (err) {
        console.error('Error checking admin status:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// User functionalities
// GET /api/:api_version/user/ownbooks
userRouter.get('/ownbooks', authCookieMiddleware, ownbooksHandler);

// return all orders of the user
// GET /api/:api_version/user/orders
userRouter.get('/orders', authCookieMiddleware, ordersHandler);

// return a specific order for the user
// GET /api/:api_version/user/orders/:id
userRouter.get(
    '/orders/:id',
    authCookieMiddleware,
    param('id').isString().notEmpty(),
    handleValidationErrors,
    orderDetailHandler);

// Create a new order for the user
// POST /api/:api_version/user/orders
userRouter.post(
    '/orders',
    authCookieMiddleware,
    body('type').isIn(['buy', 'refund']),
    body('bookIds').isArray({ min: 1 }),
    body('bookIds.*').isString().notEmpty(),
    handleValidationErrors,
    ordersHandler
);

// Admin-only: Delete an order by ID and remove references from users
userRouter.delete(
    '/orders/:id',
    authCookieMiddleware,
    ensureAdmin,
    param('id').isString().notEmpty(),
    handleValidationErrors,
    async (req, res) => {
        const orderId = req.params.id;
        try {
            await deleteOrderById(orderId);
            return res.status(200).json({ success: true, message: `Order ${orderId} deleted` });
        } catch (err: any) {
            if (err?.name === 'CastError') {
                return res.status(400).json({ success: false, error: 'Invalid order ID format' });
            }
            return res.status(500).json({ success: false, error: 'Failed to delete order' });
        }
    }
);