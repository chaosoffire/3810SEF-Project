import express from 'express';
import { authCookieMiddleware } from '../auth/cookie.middleware';
import { ensureAdmin } from '../auth/roles.middleware';

export const adminRouter = express.Router({ mergeParams: true });

// Protect all admin routes with session auth and admin role check
adminRouter.use(authCookieMiddleware, ensureAdmin);

// Basic admin ping for verification
adminRouter.get('/health', (_req, res) => {
	res.json({ ok: true, scope: 'admin' });
});

// Placeholder routes can be added here, e.g., adminRouter.get('/stats', ...)
