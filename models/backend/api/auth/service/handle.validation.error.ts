import type { NextFunction, Request, Response } from "express";

import { validationResult } from "express-validator";

// Helpers
export const handleValidationErrors = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: "Validation failed",
            details: errors.array(),
        });
    }
    next();
};
