import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "./api-client";
import { ApiError } from "./api-error";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("apiClient", () => {
	beforeEach(() => {
		mockFetch.mockClear();
	});

	describe("successful request", () => {
		it("makes a GET request and returns JSON data", async () => {
			const mockData = { id: 1, name: "Test" };
			const mockResponse = new Response(JSON.stringify(mockData), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
				},
			});
			mockFetch.mockResolvedValue(mockResponse);

			const result = await apiClient<{ id: string }>("/test", {
				method: "GET",
			});

			expect(mockFetch).toHaveBeenCalledWith(
				"http://localhost:3001/api/test",
				expect.objectContaining({
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}),
			);

			expect(result).toEqual(mockData);
		});

		it("makes a POST request with JSON body", async () => {
			const mockData = { success: true };
			const requestBody = {
				email: "test@example.com",
				password: "secret",
			};
			const mockResponse = new Response(JSON.stringify(mockData), {
				headers: {
					"Content-Type": "application/json",
				},
				status: 201,
			});

			mockFetch.mockResolvedValue(mockResponse);

			const result = await apiClient<{ success: true }>("/auth/login", {
				method: "POST",
				body: requestBody,
			});

			expect(mockFetch).toHaveBeenCalledWith(
				"http://localhost:3001/api/auth/login",
				expect.objectContaining({
					method: "POST",
					body: JSON.stringify(requestBody),
				}),
			);
			expect(result).toEqual(mockData);
		});

		it("handles non-JSON text responses", async () => {
			const mockText = "Plain text response";
			const mockResponse = new Response(JSON.stringify(mockText), {
				headers: {
					"Content-Type": "application/json",
				},
				status: 200,
			});
			mockFetch.mockResolvedValue(mockResponse);

			const result = await apiClient<string>("/text-endpoint");

			expect(mockFetch).toHaveBeenCalledWith(
				"http://localhost:3001/api/text-endpoint",
				expect.objectContaining({
					headers: {
						"Content-Type": "application/json",
					},
				}),
			);
			expect(result).toBe(mockText);
		});

		it("merges custom headers with default headers", async () => {
			const mockData = { data: "test" };
			const mockResponse = new Response(JSON.stringify(mockData), {
				headers: {
					"Content-Type": "application/json",
				},
				status: 200,
			});
			mockFetch.mockResolvedValue(mockResponse);

			await apiClient("/test", {
				headers: {
					Authorization: "Bearer token123",
				},
			});

			expect(mockFetch).toHaveBeenCalledWith(
				"http://localhost:3001/api/test",
				expect.objectContaining({
					headers: {
						"Content-Type": "application/json",
						Authorization: "Bearer token123",
					},
				}),
			);
		});
	});

	describe("error responses", () => {
		it("throws ApiError for 4xx responses with JSON error message", async () => {
			const errorResponse = { message: "Invalid credentials" };
			const mockResponse = new Response(JSON.stringify(errorResponse), {
				headers: {
					"Content-Type": "application/json",
				},
				status: 401,
				statusText: "Unauthorized",
			});

			mockFetch.mockResolvedValue(mockResponse);

			await expect(
				apiClient("/auth/login", { method: "POST", body: {} }),
			).rejects.toThrow(ApiError);

			expect(mockFetch).toHaveBeenCalledWith(
				"http://localhost:3001/api/auth/login",
				expect.objectContaining({
					headers: {
						"Content-Type": "application/json",
					},
					method: "POST",
				}),
			);
		});

		it("includes response headers in ApiError", async () => {
			const mockResponse = new Response(
				JSON.stringify({ message: "Too many requests" }),
				{
					headers: {
						"Content-Type": "application/json",
						"Retry-After": "60",
					},
					status: 429,
					statusText: "Too many requests",
				},
			);

			mockFetch.mockResolvedValue(mockResponse);

			const error = await apiClient("/test").catch((e) => e);

			expect(error).toBeInstanceOf(ApiError);

			if (error instanceof ApiError) {
				expect(error.headers?.get("Retry-After")).toBe("60");
			}
		});
	});

	describe("network errors", () => {
		it("wraps network errors in Error with message", async () => {
			const networkError = new Error("Network connection failed");
			mockFetch.mockRejectedValue(networkError);

			await expect(apiClient("/test")).rejects.toThrow(
				"Request failed: Network connection failed",
			);
		});
	});
});
