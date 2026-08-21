"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	type ForgotPasswordInput,
	forgotPasswordSchema,
} from "@repo/api-contracts";
import Link from "next/link";
import { useState } from "react";
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
import { ApiError } from "@/lib/api-error";
import { useForgotPassword } from "../hooks/use-forgot-password";
import { ForgotPasswordSuccess } from "./forgot-password-success";

type Props = {
	onSuccess(email: string): void;
};

export function ForgotPasswordForm({ onSuccess }: Props) {
	const [countdown, setCountdown] = useState(0);
	const forgotPasswordMutation = useForgotPassword();
	const form = useForm<ForgotPasswordInput>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: "ahmadmaulana4040@gmail.com",
		},
	});

	function onSubmit(values: ForgotPasswordInput) {
		forgotPasswordMutation.mutate(values, {
			onSuccess: () => {
				onSuccess(values.email);
			},
			onError: (error) => {
				if (error instanceof ApiError && error.status === 429) {
					console.log(error.headers?.get("Retry-After"));

					const retryAfter = Number(error.headers?.get("Retry-After")) || 60;
					setCountdown(retryAfter);
				}
			},
		});
	}

	if (forgotPasswordMutation.isError) {
		return (
			<ForgotPasswordSuccess
				email={form.getValues("email")}
				countdown={countdown}
			/>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Forgot your password?</CardTitle>
					<CardDescription>
						Enter your email address and we&apos;ll send you a link to reset
						your password.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<FieldGroup>
							<Controller
								name="email"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field>
										<FieldLabel htmlFor="email">Email</FieldLabel>
										<Input
											{...field}
											id="email"
											type="email"
											aria-invalid={fieldState.invalid}
											placeholder="m@example.com"
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>

							<Field>
								<Button
									type="submit"
									disabled={forgotPasswordMutation.isPending}
								>
									Send Reset Link
								</Button>
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
