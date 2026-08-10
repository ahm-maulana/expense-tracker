import { randomUUID } from "node:crypto";
import type { User, UserToken } from "../../generated/prisma/client.js";

export const createMockUser = (overrides?: Partial<User>): User => {
	return {
		id: randomUUID(),
		name: "John Doe",
		email: "john@example.com",
		passwordHash: "hashed-password",
		createdAt: new Date("2026-01-01"),
		updatedAt: new Date("2026-01-01"),
		...overrides,
	};
};

export const createMockUserToken = (
	overrides?: Partial<UserToken>,
): UserToken => {
	return {
		id: randomUUID(),
		tokenHash: "hashed-token",
		type: "PASSWORD_RESET",
		userId: "user_123",
		expiresAt: new Date(Date.now() + 5 * 60 * 1000),
		consumedAt: null,
		revokedAt: null,
		createdAt: new Date(),
		...overrides,
	};
};
