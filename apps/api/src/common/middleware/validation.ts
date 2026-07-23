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
			if (schema.body) {
				req.body = schema.body.parse(req.body);
			}

			if (schema.query) {
				const validated = schema.query.parse(req.query);
				Object.assign(req.query, validated);
			}

			if (schema.params) {
				schema.params.parse(req.params);
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
