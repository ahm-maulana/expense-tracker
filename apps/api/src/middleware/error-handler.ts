import type { NextFunction, Request, Response } from "express";

export function errorHandler(
	_error: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	return res.status(500).json({
		message: "Internal Server Error",
	});
}
