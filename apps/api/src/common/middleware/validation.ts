import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

interface ValidationSchema {
	body?: ZodType;
	query?: ZodType;
	params?: ZodType;
}

export function validate(schema: ValidationSchema) {
	return (req: Request, _res: Response, next: NextFunction) => {
		try {
			req.validated ??= {};
			if (schema.body) {
				req.validated.body = schema.body.parse(req.body);
			}

			if (schema.query) {
				req.validated.query = schema.query.parse(req.query);
			}

			if (schema.params) {
				req.validated.params = schema.params.parse(req.params);
			}

			next();
		} catch (error) {
			next(error);
		}
	};
}

export function validateBody(schema: ZodType) {
	return validate({ body: schema });
}

export function validateQuery(schema: ZodType) {
	return validate({ query: schema });
}

export function validateParams(schema: ZodType) {
	return validate({ params: schema });
}
