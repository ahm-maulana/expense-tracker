import { randomUUID } from "node:crypto";
import type { LoginInput, RegisterInput, UserDto } from "@repo/api-contracts";
import bcrypt from "bcrypt";
import {
	ConflictError,
	UnauthorizedError,
} from "../../common/errors/app-error.js";
import type { User } from "../../generated/prisma/client.js";
import {
	decodeToken,
	signAccessToken,
	signRefreshToken,
	verifyRefreshToken,
} from "../../lib/jwt.js";
import type AuthRepository from "./auth.repository.js";
import type {
	AccessTokenPayload,
	LoginResult,
	RefreshTokenPayload,
} from "./auth.types.js";
import type RefreshTokenRepository from "./refresh-token-repository.js";

class AuthService {
	constructor(
		private authRepository: AuthRepository,
		private refreshTokenRepository: RefreshTokenRepository,
	) {}

	async register(
		data: Omit<RegisterInput, "confirmPassword">,
	): Promise<UserDto> {
		const existingUser = await this.authRepository.findByEmail(data.email);

		if (existingUser) {
			throw new ConflictError("Email already exists");
		}

		const hashedPassword = await bcrypt.hash(data.password, 10);

		const { name, email } = data;

		const user = await this.authRepository.create({
			name,
			email,
			passwordHash: hashedPassword,
		});

		return {
			id: user.id,
			email: user.email,
			name: user.name,
		};
	}

	async login(data: LoginInput): Promise<LoginResult> {
		const existingUser = await this.authRepository.findByEmail(data.email);

		if (!existingUser) {
			throw new UnauthorizedError("Invalid email or password");
		}

		const isPasswordMatch = await bcrypt.compare(
			data.password,
			existingUser.passwordHash,
		);

		if (!isPasswordMatch) {
			throw new UnauthorizedError("Invalid email or password");
		}

		const jti = randomUUID();

		const { accessToken, refreshToken } = await this.issueTokens(
			existingUser,
			jti,
		);

		const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

		const decoded = decodeToken(refreshToken);

		if (!decoded) {
			throw new UnauthorizedError("Invalid refresh token.");
		}

		const expiredDate = decoded.exp
			? new Date(decoded.exp)
			: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

		await this.refreshTokenRepository.create({
			userId: existingUser.id,
			jti,
			tokenHash: hashedRefreshToken,
			expiresAt: expiredDate,
		});

		return {
			user: {
				id: existingUser.id,
				name: existingUser.name,
				email: existingUser.email,
			},
			accessToken,
			refreshToken,
		};
	}

	async refresh(refreshToken: string): Promise<LoginResult> {
		if (!refreshToken) {
			throw new UnauthorizedError("Refresh token is required.");
		}

		const decoded = verifyRefreshToken(refreshToken);

		if (!decoded.jti) {
			throw new UnauthorizedError("Invalid refresh token.");
		}

		const session = await this.refreshTokenRepository.findByJti(decoded.jti);

		if (!session || session.revokedAt) {
			throw new UnauthorizedError("Invalid refresh token");
		}

		const isRefreshTokenValid = await bcrypt.compare(
			refreshToken,
			session.tokenHash,
		);

		if (!isRefreshTokenValid) {
			throw new UnauthorizedError("Invalid refresh token.");
		}

		const user = await this.authRepository.findById(session.userId);

		if (!user) {
			throw new UnauthorizedError("Invalid refresh token.");
		}

		const { accessToken, refreshToken: newRefreshToken } =
			await this.issueTokens(user, session.jti);

		const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);

		await this.refreshTokenRepository.update(session.jti, {
			tokenHash: hashedRefreshToken,
		});

		return {
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
			},
			accessToken,
			refreshToken: newRefreshToken,
		};
	}

	async logout(refreshToken: string): Promise<void> {
		if (!refreshToken) {
			return;
		}

		// Verify JWT
		const payload = verifyRefreshToken(refreshToken);

		if (!payload.jti) {
			return;
		}

		// Find session
		const session = await this.refreshTokenRepository.findByJti(payload.jti);

		if (!session) {
			return;
		}

		// Check if already revoked
		if (session.revokedAt) {
			return;
		}

		// Compare refreshToken with hashed token
		const isTokenValid = await bcrypt.compare(refreshToken, session.tokenHash);

		if (!isTokenValid) {
			return;
		}

		// Revoke session
		await this.refreshTokenRepository.revoke(session.jti);
	}

	private async issueTokens(
		user: User,
		jti: string,
	): Promise<Omit<LoginResult, "user">> {
		const accessToken = signAccessToken<AccessTokenPayload>({
			sub: user.id,
		});

		const refreshToken = signRefreshToken<RefreshTokenPayload>({
			sub: user.id,
			jti: jti,
		});

		return {
			accessToken,
			refreshToken,
		};
	}
}

export default AuthService;
