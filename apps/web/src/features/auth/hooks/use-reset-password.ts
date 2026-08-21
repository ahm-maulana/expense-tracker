import { useMutation, useQuery } from "@tanstack/react-query";
import { resetPassword, verifyResetPasswordToken } from "../api/reset-password";

export function useVerifyResetPasswordToken(token: string) {
	return useQuery({
		queryKey: ["reset-password-token", token],
		queryFn: () => verifyResetPasswordToken(token),
		enabled: !!token,
	});
}

export function useResetPassword() {
	return useMutation({
		mutationFn: resetPassword,
	});
}
