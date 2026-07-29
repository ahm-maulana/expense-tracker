import z from "zod";
import { categoryType } from "../common/schemas.js";

export const createCategorySchema = z.object({
	name: z.string().min(1, "Category name is required"),
	type: categoryType,
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(10),

	type: z.string().toUpperCase().pipe(categoryType).optional(),
	search: z.string().trim().optional(),

	sortBy: z.enum(["name", "createdAt"]).default("createdAt"),
	orderBy: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type GetCategoryQuery = z.infer<typeof categoryQuerySchema>;
