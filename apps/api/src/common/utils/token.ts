import { randomBytes } from "node:crypto";

export function generateRandomToken(size = 32): string {
	return randomBytes(size).toString("base64url");
}
