import type { ApiErrorResponse } from "@repo/api-contracts";
import type { NextFunction, Request, Response } from "express";
import z, { ZodError } from "zod";
import { AppError } from "../errors/index.js";

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

	if (error instanceof ZodError) {
		const flattenedErrors = z.flattenError(error);

		return res.status(400).json({
			message: "Validation failed",
			errors: flattenedErrors.fieldErrors,
		});
	}

	return res.status(500).json({
		message: "Internal Server Error",
	});
}
