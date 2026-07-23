import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import { validRegisterInput } from "../fixtures/user.fixture.js";

export async function createUser(data = validRegisterInput) {
	const { password, confirmPassword, ...registerFields } = data;

	return prisma.user.create({
		data: {
			...registerFields,
			passwordHash: await bcrypt.hash(password, 10),
		},
	});
}
