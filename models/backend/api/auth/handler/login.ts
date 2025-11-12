import type { NextFunction, Request, Response } from "express";

import passport from "passport";

import { createSessionToken } from "../service/session";

export async function loginHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    passport.authenticate(
        "local",
        {
            session: false,
        },
        async (err: any, user: any) => {
            if (err) return next(err);
            if (!user)
                return res.status(401).json({
                    success: false,
                    error: "Invalid credentials",
                });
            try {
                const token = await createSessionToken(user.username);
                // Return token both as header and as cookie
                res.cookie?.("x-session", token, {
                    httpOnly: true,
                    sameSite: "lax",
                    path: "/",
                    maxAge: 30 * 60 * 1000,
                } as any);
                return res.status(200).json({
                    success: true,
                    username: user.username,
                });
            } catch (e) {
                return next(e);
            }
        },
    )(req, res, next);
}
