import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { verifyAccessToken } from "../../lib/jwt.js";
import { UnauthorizedError } from "../errors/app-error.js";
import { authenticate } from "./authenticate.js";

vi.mock("../../lib/jwt.ts");

describe("authenticate", () => {
	let mockReq: Request;
	let mockRes: Response;
	let mockNext: NextFunction;

	beforeEach(() => {
		vi.clearAllMocks();

		mockReq = {
			get: vi.fn(),
		} as unknown as Request;
		mockRes = {} as Response;
		mockNext = vi.fn();
	});

	it("should set req.user and call next when access token is valid", () => {
		vi.mocked(mockReq.get)?.mockReturnValue("Bearer valid-access-token");

		vi.mocked(verifyAccessToken).mockReturnValue({
			sub: "user_123",
		});

		authenticate(mockReq, mockRes, mockNext);

		expect(mockReq.user).toEqual({
			id: "user_123",
		});
		expect(mockNext).toHaveBeenCalled();
	});

	it("should call next with UnauthorizedError when authorization is missing or not Bearer", () => {
		vi.mocked(mockReq.get)?.mockReturnValue("invalid-access-token");

		authenticate(mockReq, mockRes, mockNext);
		expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
		expect(verifyAccessToken).not.toHaveBeenCalled();
		expect(mockReq.user).toBeUndefined();
	});
});
