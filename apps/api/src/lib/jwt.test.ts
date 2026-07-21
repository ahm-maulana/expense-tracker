import { vi, describe, it, expect } from "vitest";
import {
	decodeToken,
	signAccessToken,
	signRefreshToken,
	verifyAccessToken,
	verifyRefreshToken,
} from "./jwt.js";
import { randomUUID } from "node:crypto";
import { UnauthorizedError } from "../common/errors/app-error.js";

describe("jwt", () => {
	describe("signAccessToken function", () => {
		it("should create a valid access token", async () => {
			const accessToken = signAccessToken({
				sub: "user_123",
			});

			expect(typeof accessToken).toBe("string");
		});
	});

	describe("signRefreshToken function", () => {
		it("should create a valid refresh token", () => {
			const refreshToken = signRefreshToken({
				sub: "user_123",
				jti: randomUUID(),
			});

			expect(typeof refreshToken).toBe("string");
		});
	});

	describe("verifyAccessToken", () => {
		it("should verify and return access token payload", () => {
			const accessToken = signAccessToken({
				sub: "user_123",
			});
			const decoded = verifyAccessToken(accessToken);

			expect(decoded).toHaveProperty("sub");
		});

		it("should throw UnauthorizedError when access token is invalid", () => {
			expect(() => {
				verifyAccessToken("invalid-token");
			}).toThrow(UnauthorizedError);
		});
	});

	describe("verifyRefreshToken", () => {
		it("should verify and return refresh token payload", () => {
			const refreshToken = signRefreshToken({
				sub: "user_123",
				jti: randomUUID(),
			});
			const decoded = verifyRefreshToken(refreshToken);

			expect(decoded).toMatchObject({
				sub: "user_123",
				jti: expect.any(String),
			});
		});

		it("should throw UnauthorizedError when refresh token is invalid", () => {
			expect(() => {
				verifyRefreshToken("invalid-token");
			}).toThrow(UnauthorizedError);
		});
	});

	describe("decodeToken", () => {
		it("should decode and return payload", () => {
			const token = signRefreshToken({
				sub: "user_123",
				jti: randomUUID(),
			});
			const decoded = decodeToken(token);

			expect(decoded).toMatchObject({
				sub: "user_123",
				jti: expect.any(String),
			});
		});

		it("should throw null when token is invalid", () => {
			const decoded = decodeToken("invalid-token");

			expect(decoded).toBe(null);
		});
	});
});
