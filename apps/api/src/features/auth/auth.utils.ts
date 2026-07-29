import type { Request } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { UnauthorizedError } from "../../common/errors/app-error.js";
import type { AuthenticatedUser } from "./auth.types.js";

export function getAuthenticatedUser<
	P = ParamsDictionary,
	ResBody = unknown,
	ReqBody = unknown,
	ReqQuery = unknown,
>(req: Request<P, ResBody, ReqBody, ReqQuery>): AuthenticatedUser {
	if (!req.user) {
		throw new UnauthorizedError("Authentication required.");
	}

	return req.user;
}
