import type { ApiResponse, LoginResponse } from "@repo/api-contracts";
import { createUser } from "../factories/user.factory.js";
import { validLoginInput } from "../fixtures/user.fixture.js";
import { http } from "./http.js";

export async function loginAsUser() {
	const user = await createUser();

	const response = await http.post<ApiResponse<LoginResponse>>(
		"/api/auth/login",
		validLoginInput,
	);

	return {
		user,
		accessToken: response.body.data.accessToken,
	};
}
