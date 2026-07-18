import { randomUUID } from "node:crypto";
import type { LoginInput, RegisterInput } from "@repo/api-contracts";
import bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	ConflictError,
	UnauthorizedError,
} from "../../common/errors/app-error.js";
import type { User } from "../../generated/prisma/client.js";
import {
	decodeToken,
	signAccessToken,
	signRefreshToken,
} from "../../lib/jwt.js";
import type AuthRepository from "./auth.repository.js";
import AuthService from "./auth.service.js";
import type RefreshTokenRepository from "./refresh-token-repository.js";

vi.mock("./auth.repository.ts");
vi.mock("bcrypt", () => ({
	default: {
		hash: vi.fn(),
		compare: vi.fn(),
	},
}));
vi.mock("node:crypto", () => ({
	randomUUID: () => "12345678-abcd-ef01-2345-6789abcdef01",
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
		} as unknown as AuthRepository;

		refreshTokenRepositoryMock = {
			create: vi.fn(),
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

	describe("register function", () => {
		const createUserInput: RegisterInput = {
			name: "John Doe",
			email: "john@example.com",
			password: "Secret123@",
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
			vi.mocked(authRepositoryMock.findByEmail).mockResolvedValue(userDbMock);

			vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

			vi.mocked(signAccessToken).mockReturnValue("generated-access-token");
			vi.mocked(randomUUID);
			vi.mocked(signRefreshToken).mockReturnValue("generated-refresh-token");
			const tokenExpiration = new Date(
				Date.now() + 7 * 24 * 60 * 60 * 1000,
			).getTime();
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
			});

			expect(refreshTokenRepositoryMock.create).toHaveBeenCalledWith({
				userId: userDbMock.id,
				jti: "12345678-abcd-ef01-2345-6789abcdef01",
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
});
