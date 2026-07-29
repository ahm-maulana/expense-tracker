import type { CategoryDto } from "@repo/api-contracts";
import type { Category } from "../../generated/prisma/client.js";

export function toCategoryDto(category: Category): CategoryDto {
	const { userId, ...categoryFields } = category;
	return categoryFields;
}

export function toCategoryDtos(categories: Category[]): CategoryDto[] {
	return categories.map(toCategoryDto);
}
