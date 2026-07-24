import type { UpdateUserInput } from "@repo/api-contracts";
import type { PrismaClient, User } from "../../generated/prisma/client.js";

class UserRepository {
	constructor(private prisma: PrismaClient) {}

	async findById(id: string): Promise<User | null> {
		return this.prisma.user.findUnique({
			where: {
				id,
			},
		});
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.prisma.user.findUnique({
			where: {
				email,
			},
		});
	}

	async update(id: string, data: UpdateUserInput): Promise<User> {
		return this.prisma.user.update({
			where: {
				id,
			},
			data,
		});
	}

	async updatePassword(
		id: string,
		data: { passwordHash: string },
	): Promise<User> {
		return this.prisma.user.update({
			where: {
				id,
			},
			data: {
				passwordHash: data.passwordHash,
			},
		});
	}
}

export default UserRepository;
