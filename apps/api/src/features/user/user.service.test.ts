import bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	BadRequestError,
	NotFoundError,
	UnauthorizedError,
} from "../../common/errors/app-error.js";
import type { User } from "../../generated/prisma/client.js";
import type UserRepository from "./user.repository.js";
import UserService from "./user.service.js";

vi.mock("./user.repository.ts");
vi.mock("bcrypt", () => ({
	default: {
		compare: vi.fn(),
		hash: vi.fn(),
	},
}));

describe("UserService", () => {
	let service: UserService;
	let mockRepository: UserRepository;

	const createMockUser = (overrides?: Partial<User>): User => {
		return {
			id: "user_123",
			email: "john@example.com",
			name: "John Doe",
			passwordHash: "hashed-password",
			createdAt: new Date("2026-01-01"),
			updatedAt: new Date("2026-01-01"),
			...overrides,
		};
	};

	beforeEach(() => {
		vi.clearAllMocks();

		mockRepository = {
			findById: vi.fn(),
			update: vi.fn(),
			updatePassword: vi.fn(),
		} as unknown as UserRepository;

		service = new UserService(mockRepository);
	});

	describe("getMe", () => {
		const user = createMockUser();

		it("should return user when exists", async () => {
			vi.mocked(mockRepository.findById).mockResolvedValue(user);

			const result = await service.getMe(user.id);

			expect(result).toEqual({
				id: user.id,
				email: user.email,
				name: user.name,
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
			});
			expect(mockRepository.findById).toHaveBeenCalledWith(user.id);
		});

		it("should throw NotFoundError when user doesn't exists", async () => {
			vi.mocked(mockRepository.findById).mockResolvedValue(null);

			await expect(service.getMe("invalid-id")).rejects.toThrow(NotFoundError);

			expect(mockRepository.findById).toHaveBeenCalledWith("invalid-id");
		});
	});

	describe("updateProfile", () => {
		const user = createMockUser();
		const updatedUser = createMockUser({
			name: "Alan",
		});

		it("should update profile when user exists", async () => {
			vi.mocked(mockRepository.findById).mockResolvedValue(user);
			vi.mocked(mockRepository.update).mockResolvedValue(updatedUser);

			const result = await service.updateProfile(user.id, { name: "Alan" });

			expect(result).toEqual({
				id: user.id,
				email: user.email,
				name: "Alan",
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
			});
			expect(mockRepository.findById).toHaveBeenCalledWith(user.id);
			expect(mockRepository.update).toHaveBeenCalledWith(user.id, {
				name: "Alan",
			});
		});

		it("should throw NotFoundError when user doesn't exists", async () => {
			vi.mocked(mockRepository.findById).mockResolvedValue(null);

			await expect(service.getMe("invalid-id")).rejects.toThrow(NotFoundError);

			expect(mockRepository.findById).toHaveBeenCalledWith("invalid-id");
			expect(mockRepository.update).not.toHaveBeenCalled();
		});
	});

	describe("updatePassword", () => {
		const user = createMockUser();
		const updatedUser = createMockUser({
			passwordHash: "new-hashed-password",
		});
		const updatePasswordInput = {
			currentPassword: "old-password",
			newPassword: "new-password",
			confirmPassword: "new-password",
		};

		it("should update password when current password is match", async () => {
			vi.mocked(mockRepository.findById).mockResolvedValue(user);
			vi.mocked(bcrypt.compare)
				.mockResolvedValueOnce(true as never)
				.mockResolvedValueOnce(false as never);
			vi.mocked(bcrypt.hash).mockResolvedValue("new-hashed-password" as never);
			vi.mocked(mockRepository.updatePassword).mockResolvedValue(updatedUser);

			await service.updatePassword(user.id, updatePasswordInput);

			expect(mockRepository.findById).toHaveBeenCalledWith(user.id);
			expect(bcrypt.compare).toHaveBeenCalledTimes(2);
			expect(bcrypt.compare).toHaveBeenCalledWith(
				"old-password",
				"hashed-password",
			);
			expect(bcrypt.compare).toHaveBeenCalledWith(
				"new-password",
				"hashed-password",
			);
			expect(bcrypt.hash).toHaveBeenCalledWith("new-password", 10);
			expect(mockRepository.updatePassword).toHaveBeenCalledWith(user.id, {
				passwordHash: "new-hashed-password",
			});
		});

		it("should throw UnauthorizedError when current password doesn't match", async () => {
			vi.mocked(mockRepository.findById).mockResolvedValue(user);
			vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

			await expect(
				service.updatePassword(user.id, {
					...updatePasswordInput,
					currentPassword: "wrong-password",
				}),
			).rejects.toThrow(UnauthorizedError);

			expect(mockRepository.findById).toHaveBeenCalledWith(user.id);
			expect(bcrypt.compare).toHaveBeenCalledTimes(1);
			expect(bcrypt.compare).toHaveBeenCalledWith(
				"wrong-password",
				"hashed-password",
			);
			expect(mockRepository.updatePassword).not.toHaveBeenCalled();
		});

		it("should throw BadRequestError when the new password is the same as the new password", async () => {
			vi.mocked(mockRepository.findById).mockResolvedValue(user);
			vi.mocked(bcrypt.compare)
				.mockResolvedValueOnce(true as never)
				.mockResolvedValueOnce(true as never);

			await expect(
				service.updatePassword(user.id, {
					...updatePasswordInput,
					newPassword: "old-password",
					confirmPassword: "old-password",
				}),
			).rejects.toThrow(BadRequestError);

			expect(mockRepository.findById).toHaveBeenCalledWith(user.id);
			expect(bcrypt.compare).toHaveBeenCalledTimes(2);
			expect(bcrypt.compare).toHaveBeenCalledWith(
				"old-password",
				"hashed-password",
			);
			expect(bcrypt.compare).toHaveBeenCalledWith(
				"old-password",
				"hashed-password",
			);
			expect(mockRepository.updatePassword).not.toHaveBeenCalled();
		});
	});
});
