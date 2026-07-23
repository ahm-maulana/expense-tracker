import { prisma } from "../../lib/prisma.js";

export async function cleanDatabase() {
	await prisma.refreshToken.deleteMany();
	await prisma.user.deleteMany();
}
