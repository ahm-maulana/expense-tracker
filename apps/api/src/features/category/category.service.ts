import type {
	CategoryDto,
	CreateCategoryInput,
	GetCategoryQuery,
	UpdateCategoryInput,
} from "@repo/api-contracts";
import { NotFoundError } from "../../common/errors/app-error.js";
import type { PaginatedResult } from "../../common/types/pagination.js";
import { toCategoryDto, toCategoryDtos } from "./category.mapper.js";
import type CategoryRepository from "./category.repository.js";

class CategoryService {
	constructor(private repository: CategoryRepository) {}

	async getAll(
		userId: string,
		query: GetCategoryQuery,
	): Promise<PaginatedResult<CategoryDto>> {
		const {
			page = 1,
			limit = 10,
			type,
			search,
			sortBy = "createdAt",
			orderBy = "desc",
		} = query;

		const [items, totalItems] = await Promise.all([
			this.repository.findMany(userId, {
				page,
				limit,
				type,
				search,
				sortBy,
				orderBy,
			}),
			this.repository.count(userId, {
				...(type && {
					type,
				}),
				...(search && {
					search,
				}),
			}),
		]);

		const totalPages = Math.ceil(totalItems / limit);

		return {
			items: toCategoryDtos(items),
			pagination: {
				page,
				limit,
				totalItems,
				totalPages,
			},
		};
	}

	async getById(id: string, userId: string): Promise<CategoryDto> {
		const existingCategory = await this.repository.findById(id, userId);

		if (!existingCategory) {
			throw new NotFoundError("Category not found.");
		}

		return toCategoryDto(existingCategory);
	}

	async create(
		userId: string,
		data: CreateCategoryInput,
	): Promise<CategoryDto> {
		const category = await this.repository.create(userId, data);

		return toCategoryDto(category);
	}

	async update(
		id: string,
		userId: string,
		data: UpdateCategoryInput,
	): Promise<CategoryDto> {
		const existingCategory = await this.repository.findById(id, userId);

		if (!existingCategory) {
			throw new NotFoundError("Category not found.");
		}

		const category = await this.repository.update(id, userId, data);

		return toCategoryDto(category);
	}

	async delete(id: string, userId: string): Promise<CategoryDto> {
		const existingCategory = await this.repository.findById(id, userId);

		if (!existingCategory) {
			throw new NotFoundError("Category not found.");
		}

		const deletedCategory = await this.repository.delete(id, userId);

		return toCategoryDto(deletedCategory);
	}
}

export default CategoryService;
