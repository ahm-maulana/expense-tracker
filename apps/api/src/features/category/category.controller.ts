import type {
	ApiResponse,
	CategoryDto,
	CreateCategoryInput,
	GetCategoryQuery,
	UpdateCategoryInput,
} from "@repo/api-contracts";
import type { Request, Response } from "express";
import {
	getValidatedBody,
	getValidatedParams,
	getValidatedQuery,
} from "../../common/utils/request.js";
import { getAuthenticatedUser } from "../auth/auth.utils.js";
import type CategoryService from "./category.service.js";

class CategoryController {
	constructor(private service: CategoryService) {}

	getAll = async (req: Request, res: Response<ApiResponse<CategoryDto[]>>) => {
		const query = getValidatedQuery<GetCategoryQuery>(req);

		const authUser = getAuthenticatedUser(req);

		const result = await this.service.getAll(authUser.id, query);

		res.status(200).json({
			data: result.items,
			meta: result.pagination,
		});
	};

	getById = async (req: Request, res: Response<ApiResponse<CategoryDto>>) => {
		const { id } = getValidatedParams<{ id: string }>(req);
		const authUser = getAuthenticatedUser(req);

		const category = await this.service.getById(id, authUser.id);

		res.status(200).json({
			data: category,
		});
	};

	create = async (req: Request, res: Response<ApiResponse<CategoryDto>>) => {
		const body = getValidatedBody<CreateCategoryInput>(req);
		const authUser = getAuthenticatedUser(req);

		const category = await this.service.create(authUser.id, body);

		res.status(201).json({
			data: category,
		});
	};

	update = async (req: Request, res: Response<ApiResponse<CategoryDto>>) => {
		const { id } = getValidatedParams<{ id: string }>(req);
		const body = getValidatedBody<UpdateCategoryInput>(req);
		const authUser = getAuthenticatedUser(req);

		const category = await this.service.update(id, authUser.id, body);

		res.status(200).json({
			data: category,
		});
	};

	delete = async (req: Request, res: Response<ApiResponse<CategoryDto>>) => {
		const { id } = getValidatedParams<{ id: string }>(req);
		const authUser = getAuthenticatedUser(req);

		await this.service.delete(id, authUser.id);

		res.sendStatus(204);
	};
}

export default CategoryController;
