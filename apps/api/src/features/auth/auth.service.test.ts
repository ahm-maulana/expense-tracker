import { randomUUID } from "node:crypto";
import type { LoginInput, RegisterInput } from "@repo/api-contracts";
import bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	ConflictError,
	TooManyRequestError,
	UnauthorizedError,
} from "../../common/errors/app-error.js";
import { hashToken } from "../../common/utils/hash.js";
import { generateRandomToken } from "../../common/utils/token.js";
import type {
	RefreshToken,
	User,
	UserToken,
} from "../../generated/prisma/client.js";
import {
	decodeToken,
	signAccessToken,
	signRefreshToken,
	verifyRefreshToken,
} from "../../lib/jwt.js";
import type AuthRepository from "./auth.repository.js";
import AuthService from "./auth.service.js";
import type { RefreshTokenPayload } from "./auth.types.js";
import { sendPasswordResetEmail } from "./auth-email.service.js";
import type RefreshTokenRepository from "./refresh-token-repository.js";
import type UserTokenRepository from "./user-token-repository.js";

vi.mock("./auth.repository.ts");
vi.mock("bcrypt", () => ({
	default: {
		hash: vi.fn(),
		compare: vi.fn(),
	},
}));
vi.mock("../../lib/jwt.ts");
vi.mock("../../common/utils/token.ts");
vi.mock("../../common/utils/hash.ts");
vi.mock("./auth-email.service.js");

describe("AuthService", () => {
	let service: AuthService;
	let authRepositoryMock: AuthRepository;
	let refreshTokenRepositoryMock: RefreshTokenRepository;
	let userTokenRepositoryMock: UserTokenRepository;

	beforeEach(() => {
		vi.clearAllMocks();

		authRepositoryMock = {
			create: vi.fn(),
			findByEmail: vi.fn(),
			findById: vi.fn(),
		} as unknown as AuthRepository;

		refreshTokenRepositoryMock = {
			create: vi.fn(),
			findByJti: vi.fn(),
			update: vi.fn(),
			revoke: vi.fn(),
		} as unknown as RefreshTokenRepository;

		userTokenRepositoryMock = {
			findByTokenHash: vi.fn(),
			findLatestByUserIdAndType: vi.fn(),
			create: vi.fn(),
		} as unknown as UserTokenRepository;

		service = new AuthService(
			authRepositoryMock,
			refreshTokenRepositoryMock,
			userTokenRepositoryMock,
		);
	});

	const userDbMock: User = {
		id: randomUUID(),
		name: "John Doe",
		email: "john@example.com",
		passwordHash: "hashed-password",
		createdAt: new Date("2026-1-1"),
		updatedAt: new Date("2026-1-1"),
	};

	const createMockUser = (overrides?: Partial<User>): User => {
		return {
			id: randomUUID(),
			name: "John Doe",
			email: "john@example.com",
			passwordHash: "hashed-password",
			createdAt: new Date("2026-01-01"),
			updatedAt: new Date("2026-01-01"),
			...overrides,
		};
	};

	const createMockRefreshToken = (
		overrides?: Partial<RefreshToken>,
	): RefreshToken => {
		return {
			id: randomUUID(),
			userId: randomUUID(),
			jti: randomUUID(),
			tokenHash: "hashed-refresh-token",
			expiresAt: new Date("2026-01-07"),
			revokedAt: null,
			createdAt: new Date("2026-01-01"),
			...overrides,
		};
	};

	const createMockUserToken = (overrides?: Partial<UserToken>): UserToken => {
		return {
			id: randomUUID(),
			userId: randomUUID(),
			tokenHash: "hashed-token",
			type: "PASSWORD_RESET",
			expiresAt: expect.any(Date),
			consumedAt: expect.any(Date),
			revokedAt: expect.any(Date),
			createdAt: expect.any(Date),
			...overrides,
		};
	};

	describe("register function", () => {
		const createUserInput: RegisterInput = {
			name: "John Doe",
			email: "john@example.com",
			password: "Secret123@",
			confirmPassword: "Secret123@",
		};

		it("should create user successfully", async () => {
			vi.mocked(authRepositoryMock.findByEmail).mockResolvedValue(null);
			vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password" as never);
			vi.mocked(authRepositoryMock.create).mockResolvedValue(userDbMock);

			await service.register(createUserInput);

			expect(authRepositoryMock.findByEmail).toHaveBeenCalledWith(
				"john@example.com",
			);
			expect(bcrypt.hash).toHaveBeenCalledWith("Secret123@", 10);
			expect(authRepositoryMock.create).toHaveBeenCalledWith({
				name: "John Doe",
				email: "john@example.com",
				passwordHash: "hashed-password",
			});
		});

		it("should throw ConflictError when email already exists", async () => {
			vi.mocked(authRepositoryMock.findByEmail).mockResolvedValue(userDbMock);

			await expect(service.register(createUserInput)).rejects.toThrow(
				ConflictError,
			);

			expect(authRepositoryMock.create).not.toHaveBeenCalled();
		});
	});

	describe("login function", () => {
		const loginInput: LoginInput = {
			email: "john@example.com",
			password: "Secret123@",
		};

		it("should login successfully", async () => {
			const tokenExpiration = new Date(
				Date.now() + 7 * 24 * 60 * 60 * 1000,
			).getTime();

			vi.mocked(authRepositoryMock.findByEmail).mockResolvedValue(userDbMock);

			vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

			vi.mocked(signAccessToken).mockReturnValue("generated-access-token");

			vi.mocked(signRefreshToken).mockReturnValue("generated-refresh-token");

			vi.mocked(decodeToken).mockReturnValue({
				exp: tokenExpiration,
			});

			const result = await service.login(loginInput);

			expect(result).toEqual({
				user: expect.objectContaining({
					name: "John Doe",
					email: "john@example.com",
				}),
				accessToken: "generated-access-token",
				refreshToken: "generated-refresh-token",
			});

			expect(refreshTokenRepositoryMock.create).toHaveBeenCalledWith({
				userId: userDbMock.id,
				jti: expect.any(String),
				tokenHash: "hashed-password",
				expiresAt: new Date(tokenExpiration),
			});
		});

		it("should throw UnauthorizedError when email not found", async () => {
			vi.mocked(authRepositoryMock.findByEmail).mockResolvedValue(null);

			await expect(service.login(loginInput)).rejects.toThrow(
				UnauthorizedError,
			);
			expect(bcrypt.compare).not.toHaveBeenCalled();
		});

		it("should throw UnauthorizedError when password not match", async () => {
			vi.mocked(authRepositoryMock.findByEmail).mockResolvedValue(userDbMock);
			vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

			await expect(service.login(loginInput)).rejects.toThrow(
				UnauthorizedError,
			);
		});
	});

	describe("refresh function", () => {
		const jti = randomUUID();

		const user = createMockUser();

		const decodedToken: RefreshTokenPayload = {
			sub: user.id,
			jti,
		};

		const refreshTokenSession = createMockRefreshToken({
			userId: user.id,
		});

		it("should generate new tokens", async () => {
			vi.mocked(verifyRefreshToken).mockReturnValue(decodedToken);
			vi.mocked(refreshTokenRepositoryMock.findByJti).mockResolvedValue(
				refreshTokenSession,
			);
			vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
			vi.mocked(authRepositoryMock.findById).mockResolvedValue(user);
			vi.mocked(signAccessToken).mockReturnValue("generated-access-token");
			vi.mocked(signRefreshToken).mockReturnValue("generated-refresh-token");
			vi.mocked(bcrypt.hash).mockResolvedValue("hashed-refresh-token" as never);
			vi.mocked(refreshTokenRepositoryMock.update).mockResolvedValue(
				refreshTokenSession,
			);

			const result = await service.refresh("refresh-token");

			expect(result).toEqual({
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
				},
				accessToken: "generated-access-token",
				refreshToken: "generated-refresh-token",
			});
		});

		it("should throw UnauthorizedError when refresh token is invalid", async () => {
			vi.mocked(verifyRefreshToken).mockImplementation(() => {
				throw new UnauthorizedError("Invalid refresh token");
			});

			await expect(service.refresh("invalid-refresh-token")).rejects.toThrow(
				UnauthorizedError,
			);

			expect(refreshTokenRepositoryMock.findByJti).not.toHaveBeenCalled();
		});
	});

	describe("forgotPassword function", () => {
		const user = createMockUser({
			email: "john@example.com",
		});
		const userToken = createMockUserToken({
			userId: user.id,
		});

		it("should send password reset email", async () => {
			vi.mocked(authRepositoryMock.findByEmail).mockResolvedValue(user);
			vi.mocked(
				userTokenRepositoryMock.findLatestByUserIdAndType,
			).mockResolvedValue(null);
			vi.mocked(generateRandomToken).mockReturnValue("raw-token");
			vi.mocked(hashToken).mockReturnValue("hashed-token");
			vi.mocked(userTokenRepositoryMock.create).mockResolvedValue(userToken);
			vi.mocked(sendPasswordResetEmail).mockResolvedValue();

			await service.forgotPassword(user.email);

			expect(authRepositoryMock.findByEmail).toHaveBeenCalledWith(
				"john@example.com",
			);
			expect(
				userTokenRepositoryMock.findLatestByUserIdAndType,
			).toHaveBeenCalledWith(user.id, "PASSWORD_RESET", expect.any(Date));
			expect(generateRandomToken).toHaveBeenCalled();
			expect(hashToken).toHaveBeenCalledWith("raw-token");
			expect(userTokenRepositoryMock.create).toHaveBeenCalledWith({
				userId: user.id,
				tokenHash: "hashed-token",
				type: "PASSWORD_RESET",
				expiresAt: expect.any(Date),
			});
			expect(sendPasswordResetEmail).toHaveBeenCalledWith({
				to: "john@example.com",
				token: "raw-token",
			});
		});

		it("should do nothing when user not found", async () => {
			vi.mocked(authRepositoryMock.findByEmail).mockResolvedValue(null);

			await service.forgotPassword("john@example.com");

			expect(userTokenRepositoryMock.create).not.toHaveBeenCalled();
			expect(sendPasswordResetEmail).not.toHaveBeenCalled();
		});

		it("should throw TooManyRequestError when user is in cool down", async () => {
			vi.mocked(authRepositoryMock.findByEmail).mockResolvedValue(user);
			vi.mocked(
				userTokenRepositoryMock.findLatestByUserIdAndType,
			).mockResolvedValue(userToken);

			await expect(service.forgotPassword(user.email)).rejects.toThrow(
				TooManyRequestError,
			);

			expect(userTokenRepositoryMock.create).not.toHaveBeenCalled();
		});
	});

	describe("logout function", () => {
		const jti = randomUUID();
		const refreshTokenSession = createMockRefreshToken({
			jti,
		});
		it("should logout successfully", async () => {
			vi.mocked(verifyRefreshToken).mockReturnValue({
				sub: refreshTokenSession.userId,
				jti,
			});
			vi.mocked(refreshTokenRepositoryMock.findByJti).mockResolvedValue(
				refreshTokenSession,
			);
			vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
			vi.mocked(refreshTokenRepositoryMock.revoke).mockResolvedValue(
				createMockRefreshToken({
					jti,
					revokedAt: new Date("2026-01-01"),
				}),
			);

			await service.logout("refresh-token");

			expect(verifyRefreshToken).toHaveBeenCalledWith("refresh-token");
			expect(refreshTokenRepositoryMock.findByJti).toHaveBeenCalledWith(jti);
			expect(bcrypt.compare).toHaveBeenCalledWith(
				"refresh-token",
				"hashed-refresh-token",
			);
			expect(refreshTokenRepositoryMock.revoke).toHaveBeenCalledWith(jti);
		});
	});
});
