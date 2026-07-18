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
}

export default RefreshTokenRepository;
