import request, { type Response } from "supertest";
import app from "../../app.js";

export type TestResponse<T = unknown> = {
	status: number;
	headers: Response["headers"];
	body: T;
};

type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

type RequestBody = string | Record<string, unknown> | undefined;

export async function testRequest<T = unknown>(options: {
	method: HttpMethod;
	path: string;
	body?: RequestBody;
	headers?: Response["headers"];
	cookies?: string[];
}): Promise<TestResponse<T>> {
	const req = request(app)[options.method](options.path);

	// Set header
	if (options.headers) {
		req.set(options.headers);
	}

	// Set cookie
	if (options.cookies?.length) {
		req.set("Cookie", options.cookies.join("; "));
	}

	// Send body
	const response = await req.send(options.body);

	return {
		status: response.status,
		headers: response.headers,
		body: response.body as T,
	};
}

export const http = {
	get: <T = unknown>(
		path: string,
		init?: { headers?: Response["headers"]; cookies?: string[] },
	) => testRequest<T>({ method: "get", path, ...init }),

	post: <T = unknown>(
		path: string,
		body?: RequestBody,
		init?: {
			headers?: Response["headers"];
			cookies?: string[];
		},
	) => testRequest<T>({ method: "post", path, body, ...init }),

	put: <T = unknown>(
		path: string,
		body?: RequestBody,
		init?: {
			headers?: Response["headers"];
			cookies?: string[];
		},
	) => testRequest<T>({ method: "put", path, body, ...init }),

	patch: <T = unknown>(
		path: string,
		body?: RequestBody,
		init?: {
			headers?: Response["headers"];
			cookies?: string[];
		},
	) => testRequest<T>({ method: "patch", path, body, ...init }),

	delete: <T = unknown>(
		path: string,
		body?: RequestBody,
		init?: {
			headers?: Response["headers"];
			cookies?: string[];
		},
	) => testRequest<T>({ method: "delete", path, body, ...init }),
};
