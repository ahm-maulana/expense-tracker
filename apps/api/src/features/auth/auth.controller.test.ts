import { randomUUID } from "node:crypto";
import type { UserDto } from "@repo/api-contracts";
import type { CookieOptions, NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	ConflictError,
	UnauthorizedError,
} from "../../common/errors/app-error.js";
import { getValidatedBody } from "../../common/utils/request.js";
import AuthController from "./auth.controller.js";
import type AuthService from "./auth.service.js";
import type { LoginResult } from "./auth.types.js";

vi.mock("./auth.service.ts");
vi.mock("../../common/utils/request.ts", () => ({
	getValidatedBody: vi.fn(),
}));

function createMockUser(overrides?: Partial<UserDto>): UserDto {
	return {
		id: randomUUID(),
		email: "john@example.com",
		name: "John Doe",
		...overrides,
	};
}

function createMockCookieOptions(
	overrides?: Partial<CookieOptions>,
): CookieOptions {
	return {
		httpOnly: true,
		secure: false,
		sameSite: "strict",
		maxAge: 604800000,
		...overrides,
	};
}

describe("AuthController", () => {
	let controller: AuthController;
	let mockService: AuthService;
	let mockReq: Request;
	let mockRes: Response;
	let mockNext: NextFunction;

	beforeEach(() => {
		vi.clearAllMocks();

		mockReq = {} as Request;

		mockRes = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
			cookie: vi.fn().mockReturnThis(),
			clearCookie: vi.fn().mockReturnThis(),
			sendStatus: vi.fn().mockReturnThis(),
		} as unknown as Response;

		mockNext = vi.fn();

		mockService = {
			register: vi.fn(),
			login: vi.fn(),
			refresh: vi.fn(),
			forgotPassword: vi.fn(),
			logout: vi.fn(),
		} as unknown as AuthService;

		controller = new AuthController(mockService);
	});

	describe("register function", () => {
		const user = createMockUser();

		it("should call AuthService.register and return 201 Created", async () => {
			mockReq.body = {
				name: "John Doe",
				email: "john@example.com",
				password: "Secret123@",
				confirmPassword: "Secret123@",
			};
			vi.mocked(mockService.register).mockResolvedValue(user);

			await controller.register(mockReq, mockRes, mockNext);

			expect(mockRes.status).toHaveBeenCalledWith(201);
			expect(mockRes.json).toHaveBeenCalledWith({
				data: {
					user: {
						id: user.id,
						email: user.email,
						name: user.name,
					},
				},
				message: "Account created successfully.",
			});
		});

		it("should call next(error) when user already exists", async () => {
			mockReq.body = {
				name: "John Doe",
				email: "john@example.com",
				password: "Secret123@",
				confirmPassword: "Secret123@",
			};

			const conflictError = new ConflictError("Email already exists.");
			vi.mocked(mockService.register).mockImplementation(() => {
				throw conflictError;
			});

			await controller.register(mockReq, mockRes, mockNext);

			expect(mockNext).toHaveBeenCalledWith(
				expect.objectContaining({
					name: "ConflictError",
					message: "Email already exists.",
				}),
			);
			expect(mockRes.status).not.toHaveBeenCalled();
		});
	});

	describe("login function", () => {
		const user = createMockUser();
		const loginResult: LoginResult = {
			user,
			accessToken: "access-token",
			refreshToken: "refresh-token",
		};

		const cookieOptions = createMockCookieOptions();

		it("should generate tokens and return 200", async () => {
			mockReq = {
				body: {
					email: "john@example.com",
					password: "Secret123@",
				},
			} as Request;

			vi.mocked(mockService.login).mockResolvedValue(loginResult);

			await controller.login(mockReq, mockRes, mockNext);

			expect(mockRes.cookie).toHaveBeenCalledWith(
				"refreshToken",
				"refresh-token",
				cookieOptions,
			);

			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				data: {
					user,
					accessToken: "access-token",
				},
			});
		});

		it("should call next(error) when email or password is invalid", async () => {
			mockReq = {
				body: {
					email: "john@example.com",
					password: "invalid-password",
				},
			} as Request;
			vi.mocked(mockService.login).mockImplementation(() => {
				throw new UnauthorizedError("Invalid email or password");
			});

			await controller.login(mockReq, mockRes, mockNext);

			expect(mockNext).toHaveBeenCalledWith(
				expect.objectContaining({
					name: "UnauthorizedError",
					message: "Invalid email or password",
				}),
			);
			expect(mockRes.cookie).not.toHaveBeenCalled();
			expect(mockRes.status).not.toHaveBeenCalled();
		});
	});

	describe("refresh function", () => {
		const user = createMockUser();
		const cookieOptions = createMockCookieOptions();

		it("should generate new tokens and return 200", async () => {
			mockReq.cookies = {
				refreshToken: "refresh-token",
			};

			vi.mocked(mockService.refresh).mockResolvedValue({
				user,
				accessToken: "access-token",
				refreshToken: "refresh-token",
			});

			await controller.refresh(mockReq, mockRes, mockNext);

			expect(mockRes.cookie).toHaveBeenCalledWith(
				"refreshToken",
				"refresh-token",
				cookieOptions,
			);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				data: {
					user,
					accessToken: "access-token",
				},
			});
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should clear cookie when refreshToken is invalid", async () => {
			mockReq.cookies = {
				refreshToken: "refresh-token",
			};
			vi.mocked(mockService.refresh).mockImplementation(() => {
				throw new UnauthorizedError("Invalid refresh token");
			});

			await controller.refresh(mockReq, mockRes, mockNext);

			expect(mockRes.clearCookie).toHaveBeenCalledWith(
				"refreshToken",
				cookieOptions,
			);
			expect(mockRes.cookie).not.toHaveBeenCalled();
			expect(mockRes.status).not.toHaveBeenCalled();
			expect(mockRes.json).not.toHaveBeenCalled();
		});
	});

	describe("forgotPassword function", () => {
		it("should return 200 and send email if email registered", async () => {
			const input = {
				email: "john@example.com",
			};
			vi.mocked(getValidatedBody).mockReturnValue(input);
			vi.mocked(mockService.forgotPassword).mockResolvedValue();

			await controller.forgotPassword(mockReq, mockRes);

			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				data: null,
				message: expect.stringContaining("password reset link"),
			});
		});
	});

	describe("logout function", () => {
		const cookieOptions = createMockCookieOptions();

		it("should clear cookie and return 204", async () => {
			mockReq.cookies = {
				refreshToken: "refresh-token",
			};
			vi.mocked(mockService.logout).mockResolvedValue();

			await controller.logout(mockReq, mockRes, mockNext);

			expect(mockRes.clearCookie).toHaveBeenCalledWith(
				"refreshToken",
				cookieOptions,
			);
			expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
		});
	});
});
