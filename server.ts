import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { initDatabase } from './models/backend/init/init.db';
import ConfigManager from './models/config/config.manager';
import backendRouter from './models/backend/backend.router';
import { pageRouter } from './models/frontend/page/router';
import path from 'path';

const app = express();
// Security & performance middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Core parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

//set static folder
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname,'/src')));

// Config manager initialization
const Config: ConfigManager = ConfigManager.getConfigManager();

// Mount model-based routers
app.use('/api/:api_version/', backendRouter);
app.use('/page',pageRouter);
// Health
// app.get('/health', (_req: Request, res: Response) => {
// 	res.json({ ok: true });
// });

app.get('/', (_req: Request, res: Response) => {
	res.redirect('/page/credential');
});

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
