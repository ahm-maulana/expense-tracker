import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../../lib/jwt.js";
import { UnauthorizedError } from "../errors/app-error.js";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
	const authorization = req.get("Authorization");

	if (!authorization?.startsWith("Bearer ")) {
		return next(
			new UnauthorizedError("Missing or invalid Authorization header."),
		);
	}
	const accessToken = authorization.slice(7);
	const payload = verifyAccessToken(accessToken);

	req.user = {
		id: payload.sub,
	};

	next();
}
