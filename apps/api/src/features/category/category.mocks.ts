import type {
	CategoryDto,
	CreateCategoryInput,
	GetCategoryQuery,
} from "@repo/api-contracts";
import type { Category } from "../../generated/prisma/client.js";

export function createMockCategory(overrides?: Partial<Category>): Category {
	return {
		id: "category-1",
		userId: "user-1",
		name: "Salary",
		type: "INCOME",
		createdAt: new Date("2026-01-01"),
		...overrides,
	};
}

export function createMockCategories(): Category[] {
	return [
		createMockCategory({
			id: "category-1",
			name: "Salary",
			type: "INCOME",
			createdAt: new Date("2026-01-15"),
		}),
		createMockCategory({
			id: "category-2",
			name: "Freelance",
			type: "INCOME",
			createdAt: new Date("2026-02-10"),
		}),
		createMockCategory({
			id: "category-3",
			name: "Food",
			type: "EXPENSE",
			createdAt: new Date("2026-03-20"),
		}),
		createMockCategory({
			id: "category-4",
			name: "Transportation",
			type: "EXPENSE",
			createdAt: new Date("2026-04-18"),
		}),
		createMockCategory({
			id: "category-5",
			name: "Shopping",
			type: "EXPENSE",
			createdAt: new Date("2026-05-22"),
		}),
	];
}

export function createMockCategoryDto(
	overrides?: Partial<CategoryDto>,
): CategoryDto {
	return {
		id: "category-1",
		name: "Salary",
		type: "INCOME",
		createdAt: new Date("2026-01-01"),
		...overrides,
	};
}

export function createMockCategoryQuery(
	overrides?: Partial<GetCategoryQuery>,
): GetCategoryQuery {
	return {
		page: 1,
		limit: 10,
		sortBy: "createdAt",
		orderBy: "desc",
		...overrides,
	};
}

export function createMockCategoryInput(
	overrides?: Partial<CreateCategoryInput>,
): CreateCategoryInput {
	return {
		name: "Salary",
		type: "INCOME",
		...overrides,
	};
}
