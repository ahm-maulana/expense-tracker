import { BadRequestError } from "../../common/errors/app-error.js";
import { hashToken } from "../../common/utils/hash.js";
import { generateRandomToken } from "../../common/utils/token.js";
import type { UserToken } from "../../generated/prisma/client.js";
import type { UserTokenType } from "../../generated/prisma/enums.js";
import {
	EMAIL_REQUEST_COOLDOWN_MS,
	PASSWORD_RESET_TOKEN_EXPIRATION_MS,
} from "./auth.constant.js";
import type { CreatedUserToken } from "./auth.types.js";
import type UserTokenRepository from "./user-token-repository.js";

class UserTokenService {
	constructor(private userTokenRepository: UserTokenRepository) {}

	async getEmailCooldown(
		userId: string,
		tokenType: UserTokenType,
	): Promise<number> {
		const cooldownStart = new Date(Date.now() - EMAIL_REQUEST_COOLDOWN_MS);

		const token = await this.userTokenRepository.findLatestByUserIdAndType(
			userId,
			tokenType,
			cooldownStart,
		);

		if (!token) {
			return 0;
		}

		const elapsed = Date.now() - token.createdAt.getTime();
		const remainingMs = EMAIL_REQUEST_COOLDOWN_MS - elapsed;

		return Math.max(0, Math.ceil(remainingMs / 1000));
	}

	async create(
		userId: string,
		tokenType: UserTokenType,
	): Promise<CreatedUserToken> {
		const rawToken = generateRandomToken();

		const hashedToken = hashToken(rawToken);
		const tokenExpiresAt = new Date(
			Date.now() + PASSWORD_RESET_TOKEN_EXPIRATION_MS,
		);

		const userToken = await this.userTokenRepository.create({
			userId,
			tokenHash: hashedToken,
			type: tokenType,
			expiresAt: tokenExpiresAt,
		});

		return {
			token: rawToken,
			userToken,
		};
	}

	async verify(token: string, type: UserTokenType): Promise<UserToken> {
		const hashedToken = hashToken(token);

		const verificationToken =
			await this.userTokenRepository.findByTokenHash(hashedToken);

		if (
			!verificationToken ||
			verificationToken.type !== type ||
			verificationToken.consumedAt ||
			verificationToken.revokedAt ||
			verificationToken.expiresAt <= new Date()
		) {
			throw new BadRequestError("Invalid or expired token");
		}

		return verificationToken;
	}

	async consume(id: string): Promise<void> {
		await this.userTokenRepository.markAsUsed(id);
	}
}

export default UserTokenService;
