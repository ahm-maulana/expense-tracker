import jwt, { type JwtPayload } from "jsonwebtoken";
import type { StringValue } from "ms";
import { env } from "../config/env.js";

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

export function decodeToken(token: string) {
	return jwt.decode(token) as JwtPayload;
}
