import { prisma } from "../../lib/prisma.js";

export async function cleanDatabase() {
	await prisma.category.deleteMany();
	await prisma.userToken.deleteMany();
	await prisma.refreshToken.deleteMany();
	await prisma.user.deleteMany();
}
