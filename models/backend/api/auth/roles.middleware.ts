import { Request, Response, NextFunction } from 'express';
import * as userRepo from '../../database/model/user/user.repository';

// Authorization middleware to ensure the current session user is an admin
export async function ensureAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const username = req.runtime?.username;
    if (!username) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const user = (await userRepo.getUserByUsername(username)) as unknown as
      | { role?: string | null }
      | null;
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    if (user.role === 'admin'){
      if (!req.runtime) (req as any).runtime = {};
      (req as any).runtime.role = 'admin';
      return next();
    }

    return res.status(401).json({ success: false, error: 'Unauthorized' });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
}
