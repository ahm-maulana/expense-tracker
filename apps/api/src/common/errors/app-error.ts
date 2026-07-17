export abstract class AppError extends Error {
	constructor(
		message: string,
		public readonly statusCode: number,
		public readonly code: string,
	) {
		super(message);
		this.name = new.target.name;
		Error.captureStackTrace?.(this, new.target);
	}
}

export class NotFoundError extends AppError {
	constructor(message: string = "Resource not found") {
		super(message, 404, "NOT_FOUND_ERROR");
	}
}

export class UnauthorizedError extends AppError {
	constructor(message: string = "Unauthorized") {
		super(message, 401, "UNAUTHORIZED_ERROR");
	}
}

export class ForbiddenError extends AppError {
	constructor(message: string = "Forbidden") {
		super(message, 403, "FORBIDDEN_ERROR");
	}
}

export class ConflictError extends AppError {
	constructor(message: string = "Conflict") {
		super(message, 409, "CONFLICT_ERROR");
	}
}

export class BadRequestError extends AppError {
	constructor(message: string = "Bad Request") {
		super(message, 400, "BAD_REQUEST_ERROR");
	}
}
