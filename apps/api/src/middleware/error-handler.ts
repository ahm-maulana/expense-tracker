import type { ApiErrorResponse } from "@repo/api-contracts";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../common/errors/index.js";

export function errorHandler(
	error: Error,
	_req: Request,
	res: Response<ApiErrorResponse>,
	_next: NextFunction,
) {
	if (error instanceof AppError) {
		return res.status(error.statusCode).json({
			message: error.message,
		});
	}

	return res.status(500).json({
		message: "Internal Server Error",
	});
}
