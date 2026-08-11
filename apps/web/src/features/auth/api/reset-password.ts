import type { ApiResponse, ResetPasswordInput } from "@repo/api-contracts";
import { api } from "@/lib/api-client";

export async function verifyResetPasswordToken(
	token: string,
): Promise<ApiResponse<null>> {
	return api.get(`/auth/reset-password/verify?token=${token}`);
}

export async function resetPassword(
	input: ResetPasswordInput,
): Promise<ApiResponse<null>> {
	return api.post("/auth/reset-password", input);
}
