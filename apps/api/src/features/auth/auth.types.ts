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
	userId: string;
	expiresAt: Date;
	revokedAt?: Date;
}
