import { Request, Response, NextFunction } from 'express';
import { verifySessionToken, isExpired, SessionPayload } from './session';
import * as userRepo from '../../../database/model/user/user.repository';

function parseCookies(req: Request): Record<string, string> {
  // Use cookie-parser output exclusively when present
  const parsed = (req as Request & { cookies?: Record<string, unknown> }).cookies;
  if (!parsed || typeof parsed !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(parsed)) {
    out[String(k)] = typeof v === 'string' ? v : String(v);
  }
  return out;
}

export async function authCookieMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Read token from cookie only
    const cookies = parseCookies(req);
    const token = cookies['x-session'];
    if (!token) return res.status(401).json({ success: false, error: 'Missing session' });

    const payload = await verifySessionToken(token);
    if (!payload) return res.status(401).json({ success: false, error: 'Invalid session' });
    if (isExpired(payload)) return res.status(401).json({ success: false, error: 'Session expired' });

    // Check against lastLogoutAt: if user logged out after this session was created, reject
    const username = payload.username;
    type UserSess = { role?: 'admin' | 'user' | 'test'; session?: { lastLogoutAt?: string | number | Date | null } };
    const userRaw = await userRepo.getUserByUsername(username);
    const user = userRaw as unknown as UserSess | null;
    const lastLogoutAt = user?.session?.lastLogoutAt != null
      ? new Date(user.session.lastLogoutAt as any).getTime()
      : null;
    if (lastLogoutAt && lastLogoutAt > payload.create_at) {
      return res.status(401).json({ success: false, error: 'Session invalidated' });
    }

    // Attach runtime info for downstream handlers
    const role = user?.role || 'user';
    req.runtime = { username, role };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
}

export type { SessionPayload };
