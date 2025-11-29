declare namespace Express {
	export interface Request {
		// for checking role when switching page
		role?: string;
		initLoad?: boolean;
	}
}
