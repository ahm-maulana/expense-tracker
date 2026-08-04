import type {
	ApiResponse,
	LoginResponse,
	RegisterResponse,
} from "@repo/api-contracts";
import { describe, expect, it } from "vitest";
import { PASSWORD_RESET_TOKEN_EXPIRATION_MS } from "../../../features/auth/auth.constant.js";
import { createUser } from "../../factories/user.factory.js";
import { createUserToken } from "../../factories/user-token.factory.js";
import {
	validLoginInput,
	validRegisterInput,
} from "../../fixtures/user.fixture.js";
import { http } from "../../helpers/http.js";

describe("Auth Integration", () => {
	describe("POST /api/auth/register", () => {
		it("should return 201 when registration is successful", async () => {
			const response = await http.post<ApiResponse<RegisterResponse>>(
				"/api/auth/register",
				validRegisterInput,
			);

			expect(response.status).toBe(201);
			expect(response.body.data).toHaveProperty("user");
			expect(response.body.data.user.email).toBe("john@example.com");
		});

		it("should return 409 when email already exists", async () => {
			await http.post("/api/auth/register", validRegisterInput);

			const response = await http.post(
				"/api/auth/register",
				validRegisterInput,
			);

			expect(response.status).toBe(409);
		});

		it("should return 400 when password and confirm password do not match", async () => {
			const registerInput = {
				...validRegisterInput,
				confirmPassword: "wrong-password",
			};

			const response = await http.post("/api/auth/register", registerInput);

			expect(response.status).toBe(400);
		});

		it("should return 400 when password is invalid", async () => {
			const registerInput = {
				...validRegisterInput,
				password: "invalid-password",
				confirmPassword: "invalid-password",
			};

			const response = await http.post("/api/auth/register", registerInput);

			expect(response.status).toBe(400);
		});
	});

	describe("POST /api/auth/login", () => {
		it("should return 200 when login is successful", async () => {
			await createUser(validRegisterInput);

			const response = await http.post<ApiResponse<LoginResponse>>(
				"/api/auth/login",
				validLoginInput,
			);

			expect(response.status).toBe(200);
			expect(response.body.data.accessToken).toEqual(expect.any(String));
			expect(response.body.data.user).toMatchObject({
				email: validLoginInput.email,
				name: validRegisterInput.name,
			});
			expect(response.headers["set-cookie"]).toBeDefined();
		});

		it("should return 401 when credential is invalid", async () => {
			const invalidLoginInput = {
				...validLoginInput,
				password: "invalid-password",
			};

			await createUser(validRegisterInput);

			const response = await http.post("/api/auth/login", invalidLoginInput);

			expect(response.status).toBe(401);
		});
	});

	describe("POST /api/auth/refresh", () => {
		it("should return 200 when new token is generated", async () => {
			await createUser(validRegisterInput);
			const loginResponse = await http.post<ApiResponse<LoginResponse>>(
				"/api/auth/login",
				validLoginInput,
			);

			const cookie = loginResponse.headers["set-cookie"] as unknown as string[];

			const refreshResponse = await http.post<ApiResponse<LoginResponse>>(
				"/api/auth/refresh",
				undefined,
				{
					cookies: cookie,
				},
			);

			expect(refreshResponse.status).toBe(200);
		});

		it("should return 401 when refresh token is invalid", async () => {
			const response = await http.post<ApiResponse<LoginResponse>>(
				"/api/auth/refresh",
				undefined,
				{
					cookies: ["refreshToken=not-a-valid-jwt"],
				},
			);

			expect(response.status).toBe(401);
		});

		it("should return 401 when revoked refresh token is used", async () => {
			await createUser(validRegisterInput);
			const loginResponse = await http.post("/api/auth/login", validLoginInput);

			const cookies = loginResponse.headers[
				"set-cookie"
			] as unknown as string[];

			await http.post("/api/auth/logout", undefined, {
				cookies,
			});

			const refreshResponse = await http.post(
				"/api/auth/refresh",
				{},
				{
					cookies,
				},
			);

			expect(refreshResponse.status).toBe(401);
		});
	});

	describe("POST /api/auth/forgot-password", () => {
		it("should return 200 and send email if registered", async () => {
			await createUser({
				email: "ahmadmaulana4040@gmail.com",
				name: "Ahmad Maulana",
				password: "Password123@",
				confirmPassword: "Password123@",
			});

			const response = await http.post<ApiResponse<null>>(
				"/api/auth/forgot-password",
				{
					email: "ahmadmaulana4040@gmail.com",
				},
			);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("message");
		});
	});

	describe("POST /api/auth/reset-password", async () => {
		it("should return 200 and reset the password when token is valid", async () => {
			const user = await createUser({
				email: "ahmadmaulana4040@gmail.com",
				name: "Ahmad Maulana",
				password: "Password123@",
				confirmPassword: "Password123@",
			});
			await createUserToken(user.id, "random-token", {
				expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRATION_MS),
			});

			const response = await http.post("/api/auth/reset-password", {
				token: "random-token",
				newPassword: "NewPassword123@",
			});

			const responseLogin = await http.post("/api/auth/login", {
				email: "ahmadmaulana4040@gmail.com",
				password: "NewPassword123@",
			});

			expect(response.status).toBe(200);
			expect(responseLogin.status).toBe(200);
		});

		it("should return 400 when token is invalid", async () => {
			const user = await createUser({
				email: "ahmadmaulana4040@gmail.com",
				name: "Ahmad Maulana",
				password: "Password123@",
				confirmPassword: "Password123@",
			});

			await createUserToken(user.id, "random-token", {
				expiresAt: new Date(Date.now() - 1000),
			});

			const response = await http.post<ApiResponse<null>>(
				"/api/auth/reset-password",
				{
					token: "random-token",
					newPassword: "NewPassword123@",
				},
			);

			expect(response.status).toBe(400);
		});
	});

	describe("POST /api/auth/logout", () => {
		it("should return 204 and revoke the refresh token when the refresh token is valid", async () => {
			await createUser(validRegisterInput);
			const loginResponse = await http.post("/api/auth/login", validLoginInput);

			const cookies = loginResponse.headers[
				"set-cookie"
			] as unknown as string[];

			const response = await http.post(
				"/api/auth/logout",
				{},
				{
					cookies: cookies,
				},
			);

			expect(response.status).toBe(204);
		});

		it("should return 204 when token is missing or invalid", async () => {
			const response = await http.post(
				"/api/auth/logout",
				{},
				{
					cookies: ["refreshToken:invalid-token"],
				},
			);

			expect(response.status).toBe(204);
		});
	});
});
