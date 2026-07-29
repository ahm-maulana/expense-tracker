import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import z, { ZodError } from "zod";
import { validate } from "./validation.js";

describe("validation", () => {
	let mockReq: Request;
	let mockRes: Response;
	let mockNext: NextFunction;

	const testBodySchema = z.object({
		email: z.email("Invalid email address"),
		name: z
			.string()
			.min(2, "Name must be at least 2 characters")
			.max(100, "Name must be at most 100 characters"),
	});

	const testQuerySchema = z.object({
		page: z.coerce.number().min(1).default(1),
		search: z.string().optional(),
	});

	const testParamsSchema = z.object({
		id: z.uuid("Invalid UUID format"),
	});

	beforeEach(() => {
		vi.clearAllMocks();

		mockReq = {
			body: {},
			query: {},
			params: {},
		} as unknown as Request;

		mockRes = {} as Response;
		mockNext = vi.fn();
	});

	describe("validate function", () => {
		it("should call next when body is valid", () => {
			mockReq.body = {
				email: "john@example.com",
				name: "John Doe",
			};
			const middleware = validate({ body: testBodySchema });

			middleware(mockReq, mockRes, mockNext);

			expect(mockNext).toHaveBeenCalledWith();
			expect(mockReq.validated).toEqual({
				body: {
					email: "john@example.com",
					name: "John Doe",
				},
			});
		});

		it("should call next(error) when body is invalid", () => {
			mockReq.body = {
				email: "john@invalid",
				name: "J",
			};
			const middleware = validate({ body: testBodySchema });

			middleware(mockReq, mockRes, mockNext);

			expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
		});

		it("should call next when query is valid", () => {
			mockReq.query = {
				page: "10",
				search: "hello",
			};

			const middleware = validate({ query: testQuerySchema });
			middleware(mockReq, mockRes, mockNext);

			expect(mockNext).toHaveBeenCalledWith();
			expect(mockReq.validated).toEqual({
				query: {
					page: 10,
					search: "hello",
				},
			});
		});

		it("should call next(error) when query is invalid", () => {
			mockReq.query = {
				page: "abc",
				search: "hello",
			};

			const middleware = validate({ query: testQuerySchema });
			middleware(mockReq, mockRes, mockNext);

			expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
		});

		it("should call next when params is valid", () => {
			const mockId = randomUUID();
			mockReq.params = {
				id: mockId,
			};

			const middleware = validate({ params: testParamsSchema });
			middleware(mockReq, mockRes, mockNext);

			expect(mockNext).toHaveBeenCalledWith();
			expect(mockReq.validated).toEqual({
				params: {
					id: mockId,
				},
			});
		});

		it("should call next(error) when params is invalid", () => {
			mockReq.params = {
				id: "invalid-uuid",
			};

			const middleware = validate({ params: testParamsSchema });
			middleware(mockReq, mockRes, mockNext);

			expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
		});
	});
});
