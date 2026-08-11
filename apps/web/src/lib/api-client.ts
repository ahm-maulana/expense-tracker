import { ApiError } from "./api-error";

const API_BASE_URL = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3001";

interface ApiClientOptions extends Omit<RequestInit, "body"> {
	body?: unknown;
	headers?: Record<string, string>;
}

export async function apiClient<T>(path: string, init: ApiClientOptions = {}) {
	const { body, headers = {}, ...restInit } = init;

	const url = `${API_BASE_URL}/api${path}`;

	const requestInit: RequestInit = {
		...restInit,
		headers: {
			"Content-Type": "application/json",
			...headers,
		},
	};

	if (body) {
		requestInit.body = JSON.stringify(body);
	}

	try {
		const response = await fetch(url, requestInit);

		const contentType = response.headers.get("content-type");
		const isJson = contentType?.includes("application/json");

		const data = isJson ? await response.json() : await response.text();

		if (!response.ok) {
			throw new ApiError(
				response.status,
				data,
				typeof data === "object" && "message" in data
					? (data.message as string)
					: response.statusText,
				response.headers,
			);
		}

		return data as T;
	} catch (error) {
		if (error instanceof ApiError) {
			throw error;
		}

		throw new Error(
			`Request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

export const api = {
	get: <T>(path: string, init?: ApiClientOptions) =>
		apiClient<T>(path, { ...init, method: "GET" }),
	post: <T>(path: string, body?: unknown, init?: ApiClientOptions) =>
		apiClient<T>(path, { ...init, method: "POST", body }),
	put: <T>(path: string, body?: unknown, init?: ApiClientOptions) =>
		apiClient<T>(path, { ...init, method: "PUT", body }),
	patch: <T>(path: string, body?: unknown, init?: ApiClientOptions) =>
		apiClient<T>(path, { ...init, method: "PATCH", body }),
	delete: <T>(path: string, init?: ApiClientOptions) =>
		apiClient<T>(path, { ...init, method: "DELETE" }),
};
