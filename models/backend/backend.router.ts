import express, {
    type NextFunction,
    type Request,
    type Response,
} from "express";

import ConfigManager from "../config/config.manager";
import passport from "./api/auth/passport/passport";
import { bookRouter } from "./api/book/router";
import { testRouter } from "./api/test/router";
import { userRouter } from "./api/user/router";

// Minimal backend router that composes model-based routers.
const backendRouter = express.Router({
    mergeParams: true,
});

// Global logger for all requests passing through the backend router
backendRouter.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const { method } = req;
    const url = req.originalUrl || req.url;
    const apiVersion = req.params?.api_version;
    // Defer logging until response is finished to capture status and duration
    res.on("finish", () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        const username = (req as any)?.runtime?.username || "-";
        const ip = req.ip || req.socket.remoteAddress || "-";
        // Compact single-line log
        console.log(
            `[API] ${method} ${url} v=${apiVersion ?? "-"} status=${status} ${duration}ms user=${username} ip=${ip}`,
        );
    });
    next();
});

// Initialize passport strategies globally so any route (e.g., /user/login) can use passport
backendRouter.use(passport.initialize());

// API version gate: ensure :api_version matches config
backendRouter.use(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const expected =
            await ConfigManager.getConfigManager().get("API_VERSION_NO");
        const got = req.params?.api_version;
        if (!got || got !== expected) {
            return res.status(426).json({
                success: false,
                error: "API version mismatch",
            });
        }
        return next();
    } catch {
        return res.status(500).json({
            success: false,
            error: "Server configuration error",
        });
    }
});

// Mount model routers under clearly named paths
backendRouter.use("/user", userRouter);
backendRouter.use("/book", bookRouter);

// Mount test router under dynamic path from config: /test/<TEST_PATH>
ConfigManager.getConfigManager()
    .get("TEST_PATH")
    .then((testPath) => {
        const mount = `/test/${String(testPath)}`;
        backendRouter.use(mount, testRouter);
    })
    .catch(() => {
        // If config missing, do not mount test router
        console.warn("TEST_PATH not set; test router not mounted");
    });

// Lightweight health endpoint
backendRouter.get("/health", async (_req: Request, res: Response) => {
    try {
        const version =
            await ConfigManager.getConfigManager().get("API_VERSION_NO");
        return res.status(200).json({
            ok: true,
            version,
        });
    } catch {
        return res.status(500).json({
            ok: false,
        });
    }
});

export default backendRouter;
