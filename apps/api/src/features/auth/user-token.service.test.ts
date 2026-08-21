import { beforeEach, describe, expect, it, vi } from "vitest";
import { BadRequestError } from "../../common/errors/app-error.js";
import { hashToken } from "../../common/utils/hash.js";
import { generateRandomToken } from "../../common/utils/token.js";
import { createMockUser, createMockUserToken } from "./auth.mocks.js";
import TokenService from "./user-token.service.js";
import type UserTokenRepository from "./user-token-repository.js";

vi.mock("../../common/utils/hash.ts", () => ({
	hashToken: vi.fn(),
}));

vi.mock("../../common/utils/token.ts", () => ({
	generateRandomToken: vi.fn(),
}));

describe("Token Service", () => {
	let service: TokenService;
	let mockUserTokenRepository: UserTokenRepository;

	beforeEach(() => {
		vi.clearAllMocks();

		mockUserTokenRepository = {
			findByTokenHash: vi.fn(),
			findLatestByUserIdAndType: vi.fn(),
			create: vi.fn(),
		} as unknown as UserTokenRepository;

		service = new TokenService(mockUserTokenRepository);
	});

	describe("getEmailCooldown", () => {
		it("should return remaining cooldown times", async () => {
			const user = createMockUser();
			const userToken = createMockUserToken({
				userId: user.id,
				createdAt: new Date(),
			});
			vi.mocked(
				mockUserTokenRepository.findLatestByUserIdAndType,
			).mockResolvedValue(userToken);

			const result = await service.getEmailCooldown(user.id, "PASSWORD_RESET");

			expect(result).toBeGreaterThan(0);
			expect(
				mockUserTokenRepository.findLatestByUserIdAndType,
			).toHaveBeenCalledWith(user.id, "PASSWORD_RESET", expect.any(Date));
		});

		it("should return 0 when user not in cooldown", async () => {
			vi.mocked(
				mockUserTokenRepository.findLatestByUserIdAndType,
			).mockResolvedValue(null);

			const result = await service.getEmailCooldown(
				"user_123",
				"PASSWORD_RESET",
			);

			expect(result).toBe(0);
		});
	});

	describe("create", () => {
		it("should create userToken successfully", async () => {
			const user = createMockUser();
			const userToken = createMockUserToken({
				userId: user.id,
			});
			vi.mocked(generateRandomToken).mockReturnValue("generated-token");
			vi.mocked(hashToken).mockReturnValue("hashed-token");
			vi.mocked(mockUserTokenRepository.create).mockResolvedValue(userToken);

			const result = await service.create(user.id, "PASSWORD_RESET");

			expect(result).toEqual({
				token: "generated-token",
				userToken,
			});
			expect(generateRandomToken).toHaveBeenCalledWith();
			expect(hashToken).toHaveBeenCalledWith("generated-token");
			expect(mockUserTokenRepository.create).toHaveBeenCalledWith({
				userId: user.id,
				tokenHash: "hashed-token",
				type: "PASSWORD_RESET",
				expiresAt: expect.any(Date),
			});
		});
	});

	describe("verify", () => {
		it("should validate token successfully", async () => {
			const user = createMockUser();
			const userToken = createMockUserToken({
				tokenHash: "hashed-token",
				userId: user.id,
			});

			vi.mocked(hashToken).mockReturnValue("hashed-token");
			vi.mocked(mockUserTokenRepository.findByTokenHash).mockResolvedValue(
				userToken,
			);

			await service.verify("token", "PASSWORD_RESET");

			expect(hashToken).toHaveBeenCalledWith("token");
			expect(mockUserTokenRepository.findByTokenHash).toHaveBeenCalledWith(
				"hashed-token",
			);
		});

		it("should throw BadRequestError when token is expired", async () => {
			const user = createMockUser();
			const userToken = createMockUserToken({
				tokenHash: "hashed-token",
				userId: user.id,
				expiresAt: new Date(Date.now() - 5 * 60 * 1000),
			});

			vi.mocked(hashToken).mockReturnValue("hashed-token");
			vi.mocked(mockUserTokenRepository.findByTokenHash).mockResolvedValue(
				userToken,
			);

			await expect(service.verify("token", "PASSWORD_RESET")).rejects.toThrow(
				BadRequestError,
			);

			expect(hashToken).toHaveBeenCalledWith("token");
			expect(mockUserTokenRepository.findByTokenHash).toHaveBeenCalledWith(
				"hashed-token",
			);
		});
	});
});
