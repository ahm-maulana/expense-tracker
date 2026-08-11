import type {
	ApiResponse,
	RegisterInput,
	RegisterResponse,
} from "@repo/api-contracts";
import { api } from "@/lib/api-client";

export async function register(
	input: RegisterInput,
): Promise<ApiResponse<RegisterResponse>> {
	return api.post("/auth/register", input);
}
