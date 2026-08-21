"use client";

import { useVerifyResetPasswordToken } from "../hooks/use-reset-password";
import { ResetPasswordForm } from "./reset-password-form";
import { ResetPasswordInvalid } from "./reset-password-invalid";
import ResetPasswordLoading from "./reset-password-loading";

type Props = {
	token: string;
};

export default function ResetPasswordContent({ token }: Props) {
	const { isPending, isError } = useVerifyResetPasswordToken(token);

	if (isPending) {
		return <ResetPasswordLoading />;
	}

	if (isError) {
		return <ResetPasswordInvalid />;
	}

	return <ResetPasswordForm token={token ?? ""} />;
}
