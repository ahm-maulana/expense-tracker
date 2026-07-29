import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "../../common/errors/app-error.js";
import {
	createMockCategories,
	createMockCategory,
	createMockCategoryDto,
	createMockCategoryInput,
	createMockCategoryQuery,
} from "./category.mocks.js";
import type CategoryRepository from "./category.repository.js";
import CategoryService from "./category.service.js";

describe("Category Service", () => {
	let service: CategoryService;
	let mockRepository: CategoryRepository;

	beforeEach(() => {
		vi.clearAllMocks();

		mockRepository = {
			findMany: vi.fn(),
			count: vi.fn(),
			findById: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		} as unknown as CategoryRepository;

		service = new CategoryService(mockRepository);
	});

	describe("getAll", () => {
		it("should return paginated categories", async () => {
			const mockCategories = createMockCategories();
			const mockCategoryQuery = createMockCategoryQuery();

			vi.mocked(mockRepository.findMany).mockResolvedValue(mockCategories);
			vi.mocked(mockRepository.count).mockResolvedValue(mockCategories.length);

			const result = await service.getAll("user-1", mockCategoryQuery);

			expect(result).toEqual({
				items: result.items,
				pagination: {
					page: 1,
					limit: 10,
					totalItems: 5,
					totalPages: 1,
				},
			});

			expect(mockRepository.findMany).toHaveBeenCalledWith(
				"user-1",
				mockCategoryQuery,
			);
			expect(mockRepository.count).toHaveBeenCalledWith("user-1", {});
		});

		it("should return empty list when no categories exist", async () => {
			const mockCategoryQuery = createMockCategoryQuery();

			vi.mocked(mockRepository.findMany).mockResolvedValue([]);
			vi.mocked(mockRepository.count).mockResolvedValue(0);

			const result = await service.getAll("user-1", mockCategoryQuery);

			expect(result).toEqual({
				items: [],
				pagination: {
					page: 1,
					limit: 10,
					totalItems: 0,
					totalPages: 0,
				},
			});

			expect(mockRepository.findMany).toHaveBeenCalledWith(
				"user-1",
				mockCategoryQuery,
			);
			expect(mockRepository.count).toHaveBeenCalledWith("user-1", {});
		});

		it("should calculate totalPages", async () => {
			const mockCategoryQuery = createMockCategoryQuery();

			vi.mocked(mockRepository.findMany).mockResolvedValue([]);
			vi.mocked(mockRepository.count).mockResolvedValue(25);

			const result = await service.getAll("user-1", mockCategoryQuery);

			expect(result.pagination.totalPages).toBe(3);
		});
	});

	describe("getById", () => {
		it("should return category if it exists", async () => {
			const mockCategory = createMockCategory();
			const mockCategoryDto = createMockCategoryDto();

			vi.mocked(mockRepository.findById).mockResolvedValue(mockCategory);

			const result = await service.getById(
				mockCategory.id,
				mockCategory.userId,
			);

			expect(result).toEqual(mockCategoryDto);

			expect(mockRepository.findById).toHaveBeenCalledWith(
				mockCategory.id,
				mockCategory.userId,
			);
		});

		it("should throw NotFoundError when category doesn't exist", async () => {
			vi.mocked(mockRepository.findById).mockResolvedValue(null);

			await expect(service.getById("invalid-id", "user-1")).rejects.toThrow(
				NotFoundError,
			);

			expect(mockRepository.findById).toHaveBeenCalledWith(
				"invalid-id",
				"user-1",
			);
		});
	});

	describe("create", () => {
		it("should create a category", async () => {
			const mockCategoryInput = createMockCategoryInput();
			const mockCategory = createMockCategory({
				name: mockCategoryInput.name,
				type: mockCategoryInput.type,
			});
			const mockCategoryDto = createMockCategoryDto({
				name: mockCategoryInput.name,
				type: mockCategoryInput.type,
			});

			vi.mocked(mockRepository.create).mockResolvedValue(mockCategory);

			const result = await service.create("user-1", mockCategoryInput);

			expect(result).toEqual(mockCategoryDto);
		});
	});

	describe("update", () => {
		it("should update a category when it exists", async () => {
			const mockCurrentCategory = createMockCategory();
			const mockUpdateCategoryInput = createMockCategoryInput({
				name: "Food",
				type: "EXPENSE",
			});
			const mockUpdatedCategory = createMockCategory({
				name: "Food",
				type: "EXPENSE",
			});
			const mockUpdatedCategoryDto = createMockCategoryDto({
				name: "Food",
				type: "EXPENSE",
			});

			vi.mocked(mockRepository.findById).mockResolvedValue(mockCurrentCategory);
			vi.mocked(mockRepository.update).mockResolvedValue(mockUpdatedCategory);

			const result = await service.update(
				"category-1",
				"user-1",
				mockUpdateCategoryInput,
			);

			expect(result).toEqual(mockUpdatedCategoryDto);
			expect(mockRepository.findById).toHaveBeenCalledWith(
				"category-1",
				"user-1",
			);
			expect(mockRepository.update).toHaveBeenCalledWith(
				"category-1",
				"user-1",
				mockUpdateCategoryInput,
			);
		});

		it("should throw NotFoundError when category doesn't exist", async () => {
			const updateCategoryInput = createMockCategoryInput();
			vi.mocked(mockRepository.findById).mockResolvedValue(null);

			await expect(
				service.update("category-1", "user-1", updateCategoryInput),
			).rejects.toThrow(NotFoundError);

			expect(mockRepository.findById).toHaveBeenCalledWith(
				"category-1",
				"user-1",
			);
			expect(mockRepository.update).not.toHaveBeenCalled();
		});
	});

	describe("delete", () => {
		it("should delete a category when it exists", async () => {
			const category = createMockCategory();
			const categoryDto = createMockCategoryDto();

			vi.mocked(mockRepository.findById).mockResolvedValue(category);
			vi.mocked(mockRepository.delete).mockResolvedValue(category);

			const result = await service.delete("category-1", "user-1");

			expect(result).toEqual(categoryDto);
		});

		it("should throw NotFoundError when category doesn't exist", async () => {
			vi.mocked(mockRepository.findById).mockResolvedValue(null);

			await expect(service.delete("invalid-id", "user-1")).rejects.toThrow(
				NotFoundError,
			);

			expect(mockRepository.findById).toHaveBeenCalledWith(
				"invalid-id",
				"user-1",
			);
			expect(mockRepository.delete).not.toHaveBeenCalled();
		});
	});
});
