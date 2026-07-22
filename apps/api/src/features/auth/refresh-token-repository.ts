import type {
	PrismaClient,
	RefreshToken,
} from "../../generated/prisma/client.js";
import type { CreateRefreshTokenInput } from "./auth.types.js";

class RefreshTokenRepository {
	constructor(private prisma: PrismaClient) {}

	async create(data: CreateRefreshTokenInput): Promise<RefreshToken> {
		return this.prisma.refreshToken.create({
			data,
		});
	}

	async findByJti(jti: string): Promise<RefreshToken | null> {
		return this.prisma.refreshToken.findUnique({
			where: {
				jti,
			},
		});
	}

	async update(
		jti: string,
		data: { tokenHash: string },
	): Promise<RefreshToken> {
		return this.prisma.refreshToken.update({
			where: {
				jti,
			},
			data: {
				tokenHash: data.tokenHash,
			},
		});
	}

	async revoke(jti: string): Promise<RefreshToken> {
		return this.prisma.refreshToken.update({
			where: {
				jti,
			},
			data: {
				revokedAt: new Date(),
			},
		});
	}
}

export default RefreshTokenRepository;
