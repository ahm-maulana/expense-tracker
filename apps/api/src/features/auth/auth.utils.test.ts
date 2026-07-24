import type { Request } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "../../common/errors/app-error.js";
import { getAuthenticatedUser } from "./auth.utils.js";

describe("AuthUtils", () => {
	let mockReq: Request;

	beforeEach(() => {
		vi.clearAllMocks();
		mockReq = {} as unknown as Request;
	});

	describe("getAuthenticatedUser", () => {
		it("should return authenticated user", () => {
			mockReq.user = {
				id: "user_123",
			};

			const result = getAuthenticatedUser(mockReq);

			expect(result).toEqual({
				id: "user_123",
			});
		});

		it("should throw UnauthorizedError when user doesn't exist", () => {
			mockReq.user = undefined;

			expect(() => getAuthenticatedUser(mockReq)).toThrow(UnauthorizedError);
		});
	});
});
