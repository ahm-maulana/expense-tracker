import { hashToken } from "../../common/utils/hash.js";
import { PASSWORD_RESET_TOKEN_EXPIRATION_MS } from "../../features/auth/auth.constant.js";
import type { UserToken } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";

export async function createUserToken(
	userId: string,
	token: string,
	overrides?: Omit<Partial<UserToken>, "userId" | "id" | "tokenHash">,
): Promise<UserToken> {
	return prisma.userToken.create({
		data: {
			userId,
			tokenHash: hashToken(token),
			type: "PASSWORD_RESET",
			expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRATION_MS),
			...overrides,
		},
	});
}
