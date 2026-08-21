import { HttpResponse, http } from "msw";

export const handlers = [
	http.post("*/api/auth/register", () => {
		return HttpResponse.json(
			{
				data: {
					id: "user-123",
					email: "john@example.com",
					name: "John Doe",
				},
			},
			{
				status: 201,
			},
		);
	}),
];
