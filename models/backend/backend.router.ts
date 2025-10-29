import express, { Request, Response, NextFunction } from 'express';
import ConfigManager from '../config/config.manager';
import { userRouter } from './api/user/router';
import authRouter from './api/auth/router';
import { bookRouter } from './api/book/router';

// Minimal backend router that composes model-based routers.
const backendRouter = express.Router({ mergeParams: true });

// Global logger for all requests passing through the backend router
backendRouter.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method } = req;
  const url = req.originalUrl || req.url;
  const apiVersion = req.params?.api_version;
  // Defer logging until response is finished to capture status and duration
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const username = (req as any)?.runtime?.username || res.locals?.username || '-';
    const ip = req.ip || req.socket.remoteAddress || '-';
    // Compact single-line log
    console.log(
      `[API] ${method} ${url} v=${apiVersion ?? '-'} status=${status} ${duration}ms user=${username} ip=${ip}`
    );
  });
  next();
});

// API version gate: ensure :api_version matches config
backendRouter.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expected = await ConfigManager.getConfigManager().get('API_VERSION_NO');
    const got = req.params?.api_version;
    if (!got || got !== expected) {
      return res.status(426).json({ success: false, error: 'API version mismatch' });
    }
    return next();
  } catch {
    return res.status(500).json({ success: false, error: 'Server configuration error' });
  }
});

// Mount model routers under clearly named paths
backendRouter.use('/user', userRouter);
backendRouter.use('/auth', authRouter);
backendRouter.use('/book', bookRouter);

// Lightweight health endpoint
backendRouter.get('/health', async (_req: Request, res: Response) => {
  try {
    const version = await ConfigManager.getConfigManager().get('API_VERSION_NO');
    return res.json({ ok: true, version });
  } catch {
    return res.json({ ok: true });
  }
});

export default backendRouter;
