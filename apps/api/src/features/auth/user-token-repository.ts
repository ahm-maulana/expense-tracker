import type {
	PrismaClient,
	UserToken,
	UserTokenType,
} from "../../generated/prisma/client.js";
import type { CreateUserTokenInput } from "./auth.types.js";

class UserTokenRepository {
	constructor(private prisma: PrismaClient) {}

	async findByTokenHash(token: string): Promise<UserToken | null> {
		return this.prisma.userToken.findUnique({
			where: {
				tokenHash: token,
			},
		});
	}

	async findLatestByUserIdAndType(
		userId: string,
		type: UserTokenType,
		since: Date,
	): Promise<UserToken | null> {
		return this.prisma.userToken.findFirst({
			where: {
				userId,
				type,
				createdAt: {
					gte: since,
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});
	}

	async create(data: CreateUserTokenInput): Promise<UserToken> {
		return this.prisma.userToken.create({
			data,
		});
	}
}

export default UserTokenRepository;
