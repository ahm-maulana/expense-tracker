import type { ApiResponse, UserProfileDto } from "@repo/api-contracts";
import { describe, expect, it } from "vitest";
import { validUpdatePasswordInput } from "../../fixtures/user.fixture.js";
import { loginAsUser } from "../../helpers/auth.js";
import { http } from "../../helpers/http.js";

describe("User Integration", () => {
	describe("GET /api/users/me", () => {
		it("should return 200 and return user data when user is authenticated", async () => {
			const { user, accessToken } = await loginAsUser();

			const response = await http.get<ApiResponse<UserProfileDto>>(
				"/api/users/me",
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			expect(response.status).toBe(200);
			expect(response.body.data).toMatchObject({
				email: user.email,
				name: user.name,
			});
		});

		it("should return 401 when user is not authenticated", async () => {
			const response =
				await http.get<ApiResponse<UserProfileDto>>("/api/users/me");

			expect(response.status).toBe(401);
		});
	});

	describe("PATCH /api/users/me", () => {
		it("should return 200 when update profile is successful", async () => {
			const { accessToken } = await loginAsUser();

			const response = await http.patch<ApiResponse<UserProfileDto>>(
				"/api/users/me",
				{
					name: "Ahmad",
				},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			expect(response.status).toBe(200);
			expect(response.body.data.name).toBe("Ahmad");
		});

		it("should return 400 when user input is not valid", async () => {
			const { accessToken } = await loginAsUser();

			const response = await http.patch(
				"/api/users/me",
				{
					name: "",
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

	describe("PATCH /api/users/me/password", () => {
		it("should return 204 when update password is successful", async () => {
			const { accessToken } = await loginAsUser();

			const response = await http.patch(
				"/api/users/me/password",
				validUpdatePasswordInput,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			expect(response.status).toBe(204);
		});

		it("should return 401 when current password is invalid", async () => {
			const { accessToken } = await loginAsUser();

			const response = await http.patch(
				"/api/users/me/password",
				{
					...validUpdatePasswordInput,
					currentPassword: "invalid-password",
				},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			expect(response.status).toBe(401);
		});

		it("should return 400 when confirmation password is not match", async () => {
			const { accessToken } = await loginAsUser();

			const response = await http.patch(
				"/api/users/me/password",
				{
					...validUpdatePasswordInput,
					confirmPassword: "invalid-password",
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
});
