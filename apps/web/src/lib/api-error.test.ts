import { describe, expect, it } from "vitest";
import { ApiError } from "./api-error";

describe("ApiError", () => {
	it("creates an API error with the response information", () => {
		const headers = new Headers({
			"Retry-After": "42",
		});

		const error = new ApiError(429, null, "Too many requests", headers);

		expect(error.message).toBe("Too many requests");
		expect(error.status).toBe(429);
		expect(error.data).toBe(null);
		expect(error.headers?.get("Retry-After")).toBe("42");
	});
});
