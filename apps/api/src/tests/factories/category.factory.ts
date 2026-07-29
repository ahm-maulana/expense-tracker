import { type Category, CategoryType } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";

interface CreateCategoryOptions {
	userId: string;
	name?: string;
	type?: CategoryType;
}

export async function createCategory({
	userId,
	name = "Food",
	type = CategoryType.EXPENSE,
}: CreateCategoryOptions): Promise<Category> {
	return prisma.category.create({
		data: {
			userId,
			name,
			type,
		},
	});
}
