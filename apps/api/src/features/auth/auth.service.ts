import { randomUUID } from "node:crypto";
import type {
	LoginInput,
	RegisterInput,
	ResetPasswordInput,
	UserDto,
} from "@repo/api-contracts";
import bcrypt from "bcrypt";
import {
	BadRequestError,
	ConflictError,
	TooManyRequestError,
	UnauthorizedError,
} from "../../common/errors/app-error.js";
import { hashToken } from "../../common/utils/hash.js";
import { generateRandomToken } from "../../common/utils/token.js";
import type { User } from "../../generated/prisma/client.js";
import {
	decodeToken,
	signAccessToken,
	signRefreshToken,
	verifyRefreshToken,
} from "../../lib/jwt.js";
import {
	PASSWORD_RESET_REQUEST_COOLDOWN_MS,
	PASSWORD_RESET_TOKEN_EXPIRATION_MS,
} from "./auth.constant.js";
import type AuthRepository from "./auth.repository.js";
import type {
	AccessTokenPayload,
	LoginResult,
	RefreshTokenPayload,
} from "./auth.types.js";
import { sendPasswordResetEmail } from "./auth-email.service.js";
import type RefreshTokenRepository from "./refresh-token-repository.js";
import type UserTokenRepository from "./user-token-repository.js";

class AuthService {
	constructor(
		private authRepository: AuthRepository,
		private refreshTokenRepository: RefreshTokenRepository,
		private userTokenRepository: UserTokenRepository,
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

	async forgotPassword(email: string): Promise<void> {
		const existingUser = await this.authRepository.findByEmail(email);

		if (!existingUser) {
			return;
		}

		const cooldownStart = new Date(
			Date.now() - PASSWORD_RESET_REQUEST_COOLDOWN_MS,
		);

		const isInCooldown =
			await this.userTokenRepository.findLatestByUserIdAndType(
				existingUser.id,
				"PASSWORD_RESET",
				cooldownStart,
			);

		if (isInCooldown) {
			throw new TooManyRequestError(
				"A reset email was recently sent. Try again in a minute",
			);
		}

		const rawToken = generateRandomToken();

		const hashedToken = hashToken(rawToken);
		const tokenExpiresAt = new Date(
			Date.now() + PASSWORD_RESET_TOKEN_EXPIRATION_MS,
		);

		await this.userTokenRepository.create({
			userId: existingUser.id,
			tokenHash: hashedToken,
			type: "PASSWORD_RESET",
			expiresAt: tokenExpiresAt,
		});

		// SEND RESET EMAIL
		await sendPasswordResetEmail({
			to: existingUser.email,
			token: rawToken,
		});
	}

	async resetPassword(data: ResetPasswordInput): Promise<void> {
		const hashedToken = hashToken(data.token);

		const userToken =
			await this.userTokenRepository.findByTokenHash(hashedToken);

		if (
			!userToken ||
			userToken.revokedAt ||
			userToken.consumedAt ||
			userToken.expiresAt <= new Date()
		) {
			throw new BadRequestError("Invalid or expired reset token.");
		}

		const existingUser = await this.authRepository.findById(userToken.userId);

		if (!existingUser) {
			throw new BadRequestError("Invalid or expired reset token.");
		}

		const hashedPassword = await bcrypt.hash(data.newPassword, 10);

		await this.authRepository.updatePassword(existingUser.id, hashedPassword);
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
