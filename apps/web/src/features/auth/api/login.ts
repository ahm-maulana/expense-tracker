import type {
	ApiResponse,
	LoginInput,
	LoginResponse,
} from "@repo/api-contracts";
import { api } from "@/lib/api-client";

export async function login(
	input: LoginInput,
): Promise<ApiResponse<LoginResponse>> {
	return api.post("/auth/login", input);
}
