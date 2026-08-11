"use client";

import { useState } from "react";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { ForgotPasswordSuccess } from "@/features/auth/components/forgot-password-success";

export default function Page() {
	const [email, setEmail] = useState<string | null>(null);

	if (email) {
		return (
			<div className="w-full max-w-sm">
				<ForgotPasswordSuccess email={email} />
			</div>
		);
	}

	return (
		<div className="w-full max-w-sm">
			<ForgotPasswordForm onSuccess={setEmail} />
		</div>
	);
}
