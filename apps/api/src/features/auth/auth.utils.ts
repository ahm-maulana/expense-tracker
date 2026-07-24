import type { Request } from "express";
import { UnauthorizedError } from "../../common/errors/app-error.js";
import type { AuthenticatedUser } from "./auth.types.js";

export function getAuthenticatedUser(req: Request): AuthenticatedUser {
	if (!req.user) {
		throw new UnauthorizedError("Authentication required.");
	}

	return req.user;
}
