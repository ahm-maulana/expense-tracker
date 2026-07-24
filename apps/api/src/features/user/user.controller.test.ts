import type { UserProfileDto } from "@repo/api-contracts";
import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "../../common/errors/app-error.js";
import { getAuthenticatedUser } from "../auth/auth.utils.js";
import UserController from "./user.controller.js";
import type UserService from "./user.service.js";

vi.mock("../auth/auth.utils.ts", () => ({
	getAuthenticatedUser: vi.fn(),
}));

describe("UserController", () => {
	let controller: UserController;
	let mockService: UserService;
	let mockReq: Request;
	let mockRes: Response;

	const createMockUser = (
		overrides?: Partial<UserProfileDto>,
	): UserProfileDto => {
		return {
			id: "user_123",
			email: "john@exampl.com",
			name: "John Doe",
			createdAt: new Date("2026-01-01"),
			updatedAt: new Date("2026-01-01"),
			...overrides,
		};
	};

	beforeEach(() => {
		vi.clearAllMocks();

		mockReq = {
			user: {
				id: "user_123",
			},
		} as unknown as Request;

		mockRes = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
			sendStatus: vi.fn().mockReturnThis(),
		} as unknown as Response;

		mockService = {
			getMe: vi.fn(),
			updateProfile: vi.fn(),
			updatePassword: vi.fn(),
		} as unknown as UserService;

		controller = new UserController(mockService);
	});

	describe("getMe", () => {
		const user = createMockUser();

		it("should return 200 when user exists", async () => {
			vi.mocked(getAuthenticatedUser).mockReturnValue({
				id: user.id,
			});
			vi.mocked(mockService.getMe).mockResolvedValue(user);

			await controller.getMe(mockReq, mockRes);

			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				data: user,
			});
		});

		it("should throw UnauthorizedError when user is not authenticated", async () => {
			vi.mocked(getAuthenticatedUser).mockImplementation(() => {
				throw new UnauthorizedError("Authentication required.");
			});

			await expect(controller.getMe(mockReq, mockRes)).rejects.toThrow(
				UnauthorizedError,
			);

			expect(mockService.getMe).not.toHaveBeenCalled();
		});
	});

	describe("updateProfile", () => {
		const user = createMockUser();

		it("should return 200 when user profile updated successfully", async () => {
			mockReq.body = {
				name: "Alan",
			};
			vi.mocked(getAuthenticatedUser).mockReturnValue({
				id: user.id,
			});
			vi.mocked(mockService.updateProfile).mockResolvedValue(user);

			await controller.updateProfile(mockReq, mockRes);

			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				data: user,
			});
		});
	});

	describe("updatePassword", () => {
		const user = createMockUser();

		it("should return 204 when user password updated successfully", async () => {
			mockReq.body = {
				currentPassword: "old-password",
				newPassword: "new-password",
				confirmPassword: "new-password",
			};
			vi.mocked(getAuthenticatedUser).mockReturnValue({
				id: user.id,
			});
			vi.mocked(mockService.updatePassword).mockResolvedValue();

			await controller.updatePassword(mockReq, mockRes);

			expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
		});
	});
});
