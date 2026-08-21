import type { ApiResponse, ForgotPasswordInput } from "@repo/api-contracts";
import { api } from "@/lib/api-client";

export async function forgotPassword(
	input: ForgotPasswordInput,
): Promise<ApiResponse<null>> {
	return api.post("/auth/forgot-password", input);
}
