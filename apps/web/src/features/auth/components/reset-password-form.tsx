"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	type ResetPasswordInput,
	resetPasswordSchema,
} from "@repo/api-contracts";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useResetPassword } from "../hooks/use-reset-password";
import { ResetPasswordInvalid } from "./reset-password-invalid";
import ResetPasswordSuccess from "./reset-password-success";

type Props = {
	token: string;
};

export function ResetPasswordForm({ token }: Props) {
	const resetPasswordMutation = useResetPassword();
	const form = useForm<ResetPasswordInput>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			token,
			newPassword: "",
			confirmPassword: "",
		},
	});

	function onSubmit(values: ResetPasswordInput) {
		resetPasswordMutation.mutate(values);
	}

	if (resetPasswordMutation.isSuccess) {
		return <ResetPasswordSuccess />;
	}

	if (resetPasswordMutation.isError) {
		return <ResetPasswordInvalid />;
	}

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Set a new password</CardTitle>
					<CardDescription>
						Choose a strong new password for your account. You&apos;ll use it
						the next time you sign in.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<FieldGroup>
							<Controller
								name="newPassword"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field>
										<FieldLabel htmlFor="newPassword">New Password</FieldLabel>
										<Input
											{...field}
											id="newPassword"
											type="password"
											aria-invalid={fieldState.invalid}
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>

							<Controller
								name="confirmPassword"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field>
										<FieldLabel htmlFor="confirmPassword">
											Confirmation Password
										</FieldLabel>
										<Input
											{...field}
											id="confirmPassword"
											type="password"
											aria-invalid={fieldState.invalid}
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>

							<Field>
								<Button type="submit">Reset Password</Button>
								<FieldDescription className="text-center">
									Remember your password? <Link href="/sign-in">Sign in</Link>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
