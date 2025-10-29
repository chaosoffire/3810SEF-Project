import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { initDatabase } from './src/backend/init/init.db';
import ConfigManager from './src/config/config.manager';
import backendRouter from './src/backend/backend.router';

const app = express();
// Security & performance middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Core parsers
app.use(express.json());
app.use(cookieParser());

// Config manager initialization
const Config: ConfigManager = ConfigManager.getConfigManager();

// Mount model-based routers
app.use('/api/:api_version/', backendRouter);

// Health
// app.get('/health', (_req: Request, res: Response) => {
// 	res.json({ ok: true });
// });

// Basic error handler, returns 500 if unhandled
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
	console.error('Unhandled error:', err);
	res.status(500).json({ error: 'Internal Server Error' });
});

let PORT = 3000;

async function start(): Promise<void> {
	// Read PORT from config (Config.has may be async)
	if (await Config.has('PORT')) {
		const value = Config.get('PORT');
		if (value !== undefined) {
			const parsed = Number(value);
			if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
				PORT = parsed;
			}
		}
	} else {
        console.warn('PORT not set in configuration, using default 3000');
    }

	// Ensure DB is ready before accepting connections
	await initDatabase();
	return new Promise((resolve) => {
		app.listen(PORT, () => {
			console.log(`Server listening on http://localhost:${PORT}`);
			resolve();
		});
	});
}

// If run directly, start the server
if (require.main === module) {
	start().catch((err) => {
		console.error('Failed to start server:', err);
		process.exit(1);
	});
}

export default app;
