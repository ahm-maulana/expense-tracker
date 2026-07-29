import type { Request } from "express";

export function getValidatedBody<T>(req: Request): T {
	if (!req.validated?.body) {
		throw new Error("Validated body is missing");
	}

	return req.validated.body as T;
}

export function getValidatedQuery<T>(req: Request): T {
	if (!req.validated?.query) {
		throw new Error("Validated query is missing");
	}

	return req.validated.query as T;
}

export function getValidatedParams<T>(req: Request): T {
	if (!req.validated?.params) {
		throw new Error("Validated params is missing");
	}

	return req.validated.params as T;
}
