import type { UserDto } from "@repo/api-contracts";
import type { UserToken } from "../../generated/prisma/client.js";
import type { UserTokenType } from "../../generated/prisma/enums.js";

export interface AccessTokenPayload {
	sub: string;
}

export interface RefreshTokenPayload {
	sub: string;
	jti: string;
}

export interface CreateUserInput {
	name: string;
	email: string;
	passwordHash: string;
}

export interface CreateRefreshTokenInput {
	jti: string;
	tokenHash: string;
	userId: string;
	expiresAt: Date;
	revokedAt?: Date;
}

export interface CreateUserTokenInput {
	userId: string;
	tokenHash: string;
	type: UserTokenType;
	expiresAt: Date;
}

export interface LoginResult {
	user: UserDto;
	accessToken: string;
	refreshToken: string;
}

export interface AuthenticatedUser {
	id: string;
}

export interface CreatedUserToken {
	token: string;
	userToken: UserToken;
}
