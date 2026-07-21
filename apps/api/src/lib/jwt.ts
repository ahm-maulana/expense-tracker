import jwt, { type JwtPayload } from "jsonwebtoken";
import type { StringValue } from "ms";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../common/errors/app-error.js";

export function signAccessToken<T extends object>(payload: T): string {
	return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
		expiresIn: env.JWT_ACCESS_EXPIRES_IN as StringValue,
	});
}

export function signRefreshToken<T extends object>(payload: T): string {
	return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
		expiresIn: env.JWT_REFRESH_EXPIRES_IN as StringValue,
	});
}

export function verifyAccessToken(accessToken: string) {
	try {
		return jwt.verify(accessToken, env.JWT_ACCESS_SECRET) as JwtPayload;
	} catch {
		throw new UnauthorizedError("Invalid access token.");
	}
}

export function verifyRefreshToken(refreshToken: string) {
	try {
		return jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtPayload;
	} catch {
		throw new UnauthorizedError("Invalid refresh token");
	}
}

export function decodeToken(token: string): JwtPayload | null {
	return jwt.decode(token) as JwtPayload;
}
