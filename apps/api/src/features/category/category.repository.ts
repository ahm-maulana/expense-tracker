import type {
	CreateCategoryInput,
	GetCategoryQuery,
	UpdateCategoryInput,
} from "@repo/api-contracts";
import type { Category, PrismaClient } from "../../generated/prisma/client.js";
import type { CategoryWhereInput } from "../../generated/prisma/models.js";

class CategoryRepository {
	constructor(private prisma: PrismaClient) {}

	async findMany(userId: string, query: GetCategoryQuery): Promise<Category[]> {
		const { search, type, sortBy, orderBy, page, limit } = query;

		const skip = (page - 1) * limit;

		const where: CategoryWhereInput = {
			userId,
			...(search && {
				name: {
					contains: search,
				},
			}),
			...(type && {
				type,
			}),
		};

		return this.prisma.category.findMany({
			where,
			orderBy: {
				[sortBy]: orderBy,
			},
			skip,
			take: limit,
		});
	}

	async findById(id: string, userId: string): Promise<Category | null> {
		return this.prisma.category.findUnique({
			where: {
				id,
				userId,
			},
		});
	}

	async count(
		userId: string,
		query: Pick<GetCategoryQuery, "search" | "type">,
	): Promise<number> {
		const { search, type } = query;

		const where: CategoryWhereInput = {
			userId,
			...(search && {
				name: {
					contains: search,
				},
			}),
			...(type && {
				type,
			}),
		};

		return this.prisma.category.count({
			where,
		});
	}

	async create(userId: string, data: CreateCategoryInput): Promise<Category> {
		return this.prisma.category.create({
			data: {
				...data,
				userId,
			},
		});
	}

	async update(
		id: string,
		userId: string,
		data: UpdateCategoryInput,
	): Promise<Category> {
		return this.prisma.category.update({
			where: {
				id,
				userId,
			},
			data,
		});
	}

	async delete(id: string, userId: string): Promise<Category> {
		return this.prisma.category.delete({
			where: {
				id,
				userId,
			},
		});
	}
}

export default CategoryRepository;
