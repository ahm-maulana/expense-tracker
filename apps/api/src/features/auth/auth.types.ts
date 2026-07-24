import type { UserDto } from "@repo/api-contracts";

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

export interface LoginResult {
	user: UserDto;
	accessToken: string;
	refreshToken: string;
}

export interface AuthenticatedUser {
	id: string;
}
