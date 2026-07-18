import type { PrismaClient, User } from "../../generated/prisma/client.js";
import type { CreateUserInput } from "./auth.types.js";

class AuthRepository {
	constructor(private prisma: PrismaClient) {}

	async create(data: CreateUserInput): Promise<User> {
		return this.prisma.user.create({
			data,
		});
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.prisma.user.findUnique({
			where: {
				email,
			},
		});
	}
}

export default AuthRepository;
