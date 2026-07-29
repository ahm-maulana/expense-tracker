import type { AuthenticatedUser } from "../features/auth/auth.types.ts";

declare global {
	namespace Express {
		interface Request {
			user?: AuthenticatedUser;
			validated?: {
				query?: unknown;
				body?: unknown;
				params?: unknown;
			};
		}
	}
}
