import { randomUUID } from "node:crypto";
import type { LoginInput, RegisterInput } from "@repo/api-contracts";
import bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	ConflictError,
	UnauthorizedError,
} from "../../common/errors/app-error.js";
import type { RefreshToken, User } from "../../generated/prisma/client.js";
import {
	decodeToken,
	signAccessToken,
	signRefreshToken,
	verifyRefreshToken,
} from "../../lib/jwt.js";
import type AuthRepository from "./auth.repository.js";
import AuthService from "./auth.service.js";
import type { RefreshTokenPayload } from "./auth.types.js";
import type RefreshTokenRepository from "./refresh-token-repository.js";

vi.mock("./auth.repository.ts");
vi.mock("bcrypt", () => ({
	default: {
		hash: vi.fn(),
		compare: vi.fn(),
	},
}));
vi.mock("../../lib/jwt.ts");

describe("AuthService", () => {
	let service: AuthService;
	let authRepositoryMock: AuthRepository;
	let refreshTokenRepositoryMock: RefreshTokenRepository;

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

		service = new AuthService(authRepositoryMock, refreshTokenRepositoryMock);
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
