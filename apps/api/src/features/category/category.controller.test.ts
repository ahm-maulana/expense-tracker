import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	getValidatedBody,
	getValidatedParams,
	getValidatedQuery,
} from "../../common/utils/request.js";
import { getAuthenticatedUser } from "../auth/auth.utils.js";
import CategoryController from "./category.controller.js";
import {
	createMockCategoryDto,
	createMockCategoryInput,
	createMockCategoryQuery,
} from "./category.mocks.js";
import type CategoryService from "./category.service.js";

vi.mock("../auth/auth.utils.js", () => ({
	getAuthenticatedUser: vi.fn(),
}));
vi.mock("../../common/utils/request.ts", () => ({
	getValidatedBody: vi.fn(),
	getValidatedQuery: vi.fn(),
	getValidatedParams: vi.fn(),
}));

describe("CategoryController", () => {
	let controller: CategoryController;
	let mockService: CategoryService;
	let mockReq: Request;
	let mockRes: Response;

	beforeEach(() => {
		vi.clearAllMocks();

		mockReq = {
			user: {
				id: "user-1",
			},
		} as unknown as Request;
		mockRes = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
			sendStatus: vi.fn().mockReturnThis(),
		} as unknown as Response;

		mockService = {
			getAll: vi.fn(),
			getById: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		} as unknown as CategoryService;

		controller = new CategoryController(mockService);
	});

	describe("getAll", () => {
		const categoryDtos = [
			createMockCategoryDto(),
			createMockCategoryDto({
				id: "category-2",
				name: "Food",
				type: "EXPENSE",
			}),
		];

		const paginatedCategoryDtos = {
			items: categoryDtos,
			pagination: {
				page: 1,
				limit: 10,
				totalItems: categoryDtos.length,
				totalPages: Math.ceil(categoryDtos.length / 10),
			},
		};

		it("should return 200 and categories with pagination", async () => {
			const query = createMockCategoryQuery();

			vi.mocked(getValidatedQuery).mockResolvedValue(query);
			vi.mocked(getAuthenticatedUser).mockReturnValue({ id: "user-1" });
			vi.mocked(mockService.getAll).mockResolvedValue(paginatedCategoryDtos);

			await controller.getAll(mockReq, mockRes);

			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				data: paginatedCategoryDtos.items,
				meta: paginatedCategoryDtos.pagination,
			});
		});

		it("should call service with correct parameters", async () => {
			const query = createMockCategoryQuery({ page: 2, limit: 20 });

			vi.mocked(getValidatedQuery).mockReturnValue(query);
			vi.mocked(getAuthenticatedUser).mockReturnValue({ id: "user-1" });
			vi.mocked(mockService.getAll).mockResolvedValue({
				items: [],
				pagination: { page: 2, limit: 20, totalItems: 0, totalPages: 0 },
			});

			await controller.getAll(mockReq, mockRes);

			expect(mockService.getAll).toHaveBeenCalledWith("user-1", query);
		});
	});

	describe("getById", () => {
		it("should return 200 when category exists", async () => {
			const categoryDto = createMockCategoryDto();
			const params = { id: "category-1" };

			vi.mocked(getValidatedParams).mockReturnValue(params);
			vi.mocked(getAuthenticatedUser).mockReturnValue({ id: "user-1" });
			vi.mocked(mockService.getById).mockResolvedValue(categoryDto);

			await controller.getById(mockReq, mockRes);

			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				data: categoryDto,
			});
		});

		it("should call service with correct parameters", async () => {
			const params = { id: "category-1" };

			vi.mocked(getValidatedParams).mockReturnValue(params);
			vi.mocked(getAuthenticatedUser).mockReturnValue({ id: "user-1" });
			vi.mocked(mockService.getById).mockResolvedValue(createMockCategoryDto());

			await controller.getById(mockReq, mockRes);

			expect(mockService.getById).toHaveBeenCalledWith("category-1", "user-1");
		});
	});

	describe("create", () => {
		it("should return 201 and created category", async () => {
			const input = createMockCategoryInput();
			const categoryDto = createMockCategoryDto();

			vi.mocked(getValidatedBody).mockReturnValue(input);
			vi.mocked(getAuthenticatedUser).mockReturnValue({ id: "user-1" });
			vi.mocked(mockService.create).mockResolvedValue(categoryDto);

			await controller.create(mockReq, mockRes);

			expect(mockRes.status).toHaveBeenCalledWith(201);
			expect(mockRes.json).toHaveBeenCalledWith({
				data: categoryDto,
			});
		});

		it("should call service with correct parameters", async () => {
			const input = createMockCategoryInput({
				name: "Food",
				type: "EXPENSE",
			});

			vi.mocked(getValidatedBody).mockReturnValue(input);
			vi.mocked(getAuthenticatedUser).mockReturnValue({ id: "user-1" });
			vi.mocked(mockService.create).mockResolvedValue(createMockCategoryDto());

			await controller.create(mockReq, mockRes);

			expect(mockService.create).toHaveBeenCalledWith("user-1", input);
		});
	});

	describe("update", () => {
		it("should return 200 and updated category", async () => {
			const params = { id: "category-1" };
			const input = createMockCategoryInput({ name: "Food", type: "EXPENSE" });
			const categoryDto = createMockCategoryDto({
				name: "Food",
				type: "EXPENSE",
			});

			vi.mocked(getValidatedParams).mockReturnValue(params);
			vi.mocked(getValidatedBody).mockReturnValue(input);
			vi.mocked(getAuthenticatedUser).mockReturnValue({ id: "user-1" });
			vi.mocked(mockService.update).mockResolvedValue(categoryDto);

			await controller.update(mockReq, mockRes);

			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				data: categoryDto,
			});
		});

		it("should call service with correct parameters", async () => {
			const params = { id: "category-1" };
			const input = createMockCategoryInput({ name: "Updated" });

			vi.mocked(getValidatedParams).mockReturnValue(params);
			vi.mocked(getValidatedBody).mockReturnValue(input);
			vi.mocked(getAuthenticatedUser).mockReturnValue({ id: "user-1" });
			vi.mocked(mockService.update).mockResolvedValue(createMockCategoryDto());

			await controller.update(mockReq, mockRes);

			expect(mockService.update).toHaveBeenCalledWith(
				"category-1",
				"user-1",
				input,
			);
		});
	});

	describe("delete", () => {
		it("should return 204 when category is deleted", async () => {
			const params = { id: "category-1" };

			vi.mocked(getValidatedParams).mockReturnValue(params);
			vi.mocked(getAuthenticatedUser).mockReturnValue({ id: "user-1" });
			vi.mocked(mockService.delete).mockResolvedValue(createMockCategoryDto());

			await controller.delete(mockReq, mockRes);

			expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
		});

		it("should call service with correct parameters", async () => {
			const params = { id: "category-1" };

			vi.mocked(getValidatedParams).mockReturnValue(params);
			vi.mocked(getAuthenticatedUser).mockReturnValue({ id: "user-1" });
			vi.mocked(mockService.delete).mockResolvedValue(createMockCategoryDto());

			await controller.delete(mockReq, mockRes);

			expect(mockService.delete).toHaveBeenCalledWith("category-1", "user-1");
		});
	});
});
