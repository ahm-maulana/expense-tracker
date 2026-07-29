import { randomUUID } from "node:crypto";
import type { ApiResponse, CategoryDto } from "@repo/api-contracts";
import { beforeEach, describe, expect, it } from "vitest";
import type { User } from "../../../generated/prisma/client.js";
import { createCategory } from "../../factories/category.factory.js";
import { createUser } from "../../factories/user.factory.js";
import { validCategoryIncomeInput } from "../../fixtures/category.fixture.js";
import { loginAsUser } from "../../helpers/auth.js";
import { http } from "../../helpers/http.js";

describe("Category Integration Test", () => {
	let user: User;
	let accessToken: string;

	beforeEach(async () => {
		const auth = await loginAsUser();
		user = auth.user;
		accessToken = auth.accessToken;
	});

	describe("GET /api/categories", () => {
		it("should return paginated categories", async () => {
			await createCategory({ userId: user.id });
			await createCategory({
				userId: user.id,
				name: validCategoryIncomeInput.name,
				type: validCategoryIncomeInput.type,
			});

			const response = await http.get<ApiResponse<CategoryDto[]>>(
				"/api/categories",
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			expect(response.status).toBe(200);
			expect(response.body.data).toHaveLength(2);
			expect(response.body.meta).toEqual({
				page: 1,
				limit: 10,
				totalItems: 2,
				totalPages: 1,
			});
		});

		it("should return only categories belonging to authenticated user", async () => {
			const randomUser = await createUser({
				email: "random@test.com",
				name: "Random User",
				password: "Random123@",
				confirmPassword: "Random123@",
			});

			await createCategory({
				userId: randomUser.id,
				name: "Salary",
				type: "INCOME",
			});

			await createCategory({ userId: user.id, name: "Food", type: "EXPENSE" });

			const response = await http.get<ApiResponse<CategoryDto[]>>(
				"/api/categories",
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			expect(response.status).toBe(200);
			expect(response.body.data).toHaveLength(1);
			expect(
				response.body.data.every((category) => category.name === "Food"),
			).toBe(true);
		});

		it("should return empty category when it doesn't exist", async () => {
			const response = await http.get<ApiResponse<CategoryDto>>(
				"/api/categories",
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			expect(response.status).toBe(200);
			expect(response.body.data).toHaveLength(0);
		});

		it("should return only expenses category", async () => {
			await createCategory({ userId: user.id });
			await createCategory({
				userId: user.id,
				name: validCategoryIncomeInput.name,
				type: validCategoryIncomeInput.type,
			});

			const response = await http.get<ApiResponse<CategoryDto[]>>(
				"/api/categories?type=expense",
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			expect(response.status).toBe(200);
			expect(
				response.body.data.every((category) => category.type === "EXPENSE"),
			).toBe(true);
		});

		it("should return only income category", async () => {
			await createCategory({ userId: user.id });
			await createCategory({
				userId: user.id,
				name: validCategoryIncomeInput.name,
				type: validCategoryIncomeInput.type,
			});

			const response = await http.get<ApiResponse<CategoryDto[]>>(
				"/api/categories?type=income",
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			expect(response.status).toBe(200);
			expect(
				response.body.data.every((category) => category.type === "INCOME"),
			).toBe(true);
		});

		it("should return categories matching the search keyword", async () => {
			await createCategory({
				userId: user.id,
			});
			await createCategory({
				userId: user.id,
				name: "Salary",
				type: "INCOME",
			});

			const response = await http.get<ApiResponse<CategoryDto[]>>(
				"/api/categories?search=salary",
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			expect(response.status).toBe(200);
			expect(
				response.body.data.every((category) =>
					category.name.toLowerCase().includes("salary"),
				),
			).toBe(true);
		});

		it("should return an empty list when no categories match the search keyword", async () => {
			await createCategory({ userId: user.id });

			const response = await http.get<ApiResponse<CategoryDto[]>>(
				"/api/categories?search=random",
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			expect(response.status).toBe(200);
			expect(response.body.data).toHaveLength(0);
		});

		it("should sort categories by name in ascending order", async () => {
			await createCategory({ userId: user.id, name: "Movie", type: "EXPENSE" });
			await createCategory({
				userId: user.id,
				name: "Utility",
				type: "EXPENSE",
			});
			await createCategory({
				userId: user.id,
				name: "Freelance",
				type: "INCOME",
			});

			const response = await http.get<ApiResponse<CategoryDto[]>>(
				"/api/categories?sortBy=name&orderBy=asc",
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			expect(response.status).toBe(200);
			expect(response.body.data.map((category) => category.name)).toEqual([
				"Freelance",
				"Movie",
				"Utility",
			]);
		});

		it("should sort categories by createdAt in ascending order", async () => {
			await createCategory({ userId: user.id, name: "Movie", type: "EXPENSE" });
			await createCategory({
				userId: user.id,
				name: "Utility",
				type: "EXPENSE",
			});
			await createCategory({
				userId: user.id,
				name: "Freelance",
				type: "INCOME",
			});

			const response = await http.get<ApiResponse<CategoryDto[]>>(
				"/api/categories?sortBy=createdAt&orderBy=asc",
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			expect(response.status).toBe(200);
			expect(response.body.data.map((category) => category.name)).toEqual([
				"Movie",
				"Utility",
				"Freelance",
			]);
		});

		it("should apply search, filter, sorting and pagination together", async () => {
			await createCategory({
				userId: user.id,
				name: "Food",
				type: "EXPENSE",
			});
			await createCategory({
				userId: user.id,
				name: "Salary",
				type: "INCOME",
			});
			await createCategory({
				userId: user.id,
				name: "School",
				type: "EXPENSE",
			});
			await createCategory({
				userId: user.id,
				name: "Movie",
				type: "EXPENSE",
			});
			await createCategory({
				userId: user.id,
				name: "Transportation",
				type: "EXPENSE",
			});

			const response = await http.get<ApiResponse<CategoryDto[]>>(
				"/api/categories?search=o&sortBy=name&orderBy=asc&type=expense&page=1&limit=3",
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			expect(response.status).toBe(200);
			expect(
				response.body.data.every((category) =>
					category.name.toLowerCase().includes("o"),
				),
			).toBe(true);
			expect(
				response.body.data.every((category) => category.type === "EXPENSE"),
			).toBe(true);
			expect(response.body.data.map((category) => category.name)).toEqual([
				"Food",
				"Movie",
				"School",
			]);
			expect(response.body.meta).toEqual({
				page: 1,
				limit: 3,
				totalItems: 4,
				totalPages: 2,
			});
		});

		it("should return 401 when user is not authenticated", async () => {
			const response = await http.get("/api/categories");

			expect(response.status).toBe(401);
		});
	});

	describe("GET /api/categories/:id", () => {
		it("should return category by id belonging to authenticated user", async () => {
			const category = await createCategory({
				userId: user.id,
			});

			const response = await http.get<ApiResponse<CategoryDto>>(
				`/api/categories/${category.id}`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			expect(response.status).toBe(200);
			expect(response.body.data).toMatchObject({
				name: "Food",
				type: "EXPENSE",
			});
		});

		it("should return 404 when category not found", async () => {
			const randomId = randomUUID();
			console.log(randomId);

			const response = await http.get<ApiResponse<CategoryDto>>(
				`/api/categories/${randomId}`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			expect(response.status).toBe(404);
		});
	});

	describe("POST /api/categories", () => {
		it("should create a new category", async () => {
			const response = await http.post<ApiResponse<CategoryDto>>(
				"/api/categories",
				validCategoryIncomeInput,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			expect(response.status).toBe(201);
			expect(response.body.data).toMatchObject({
				name: validCategoryIncomeInput.name,
				type: validCategoryIncomeInput.type,
			});
		});

		it("should return 400 when type is invalid", async () => {
			const response = await http.post<ApiResponse<CategoryDto>>(
				"/api/categories",
				{
					...validCategoryIncomeInput,
					type: "RandomType",
				},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			expect(response.status).toBe(400);
		});
	});

	describe("PATCH /api/categories/:id", () => {
		it("should update category when it exists", async () => {
			const category = await createCategory({
				userId: user.id,
				name: "Food",
				type: "EXPENSE",
			});

			const response = await http.patch<ApiResponse<CategoryDto>>(
				`/api/categories/${category.id}`,
				{
					name: "Salary",
					type: "INCOME",
				},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			expect(response.status).toBe(200);
			expect(response.body.data).toMatchObject({
				name: "Salary",
				type: "INCOME",
			});
		});

		it("should return 404 when category not found", async () => {
			const randomId = randomUUID();

			const response = await http.patch<ApiResponse<CategoryDto>>(
				`/api/categories/${randomId}`,
				{
					name: "Salary",
					type: "INCOME",
				},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			expect(response.status).toBe(404);
		});
	});

	describe("DELETE /api/categories/:id", () => {
		it("should delete category when it exists", async () => {
			const category = await createCategory({
				userId: user.id,
			});

			const response = await http.delete(`/api/categories/${category.id}`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			expect(response.status).toBe(204);
		});

		it("should return 404 when category not found", async () => {
			const randomId = randomUUID();

			const response = await http.delete(`/api/categories/${randomId}`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			expect(response.status).toBe(404);
		});
	});
});
