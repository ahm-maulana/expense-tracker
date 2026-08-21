"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type LoginInput, loginSchema } from "@repo/api-contracts";
import { AlertCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
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
import { cn } from "@/lib/utils";
import { useLogin } from "../hooks/use-login";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const router = useRouter();
	const loginMutation = useLogin();

	const form = useForm<LoginInput>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "john@example.com",
			password: "Password123@",
		},
	});

	function onSubmit(data: LoginInput) {
		loginMutation.mutate(data, {
			onSuccess: () => {
				router.push("/dashboard");
			},
			onError: (error) => {
				form.setError("root", {
					message: error.message,
				});
			},
		});
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Welcome back</CardTitle>
					<CardDescription>
						Sign in to access your expense tracker and manage your finances.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{form.formState.errors.root && (
						<Alert variant="destructive" className="max-w-md mb-4">
							<AlertCircleIcon />
							<AlertTitle>{form.formState.errors.root.message}</AlertTitle>
						</Alert>
					)}
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

							<Controller
								name="password"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field>
										<div className="flex items-center">
											<FieldLabel htmlFor="password">Password</FieldLabel>
											<Link
												href="/forgot-password"
												className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
											>
												Forgot your password?
											</Link>
										</div>
										<Input
											{...field}
											id="password"
											aria-invalid={fieldState.invalid}
											type="password"
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>

							<Field>
								<Button type="submit">Sign In</Button>
								<FieldDescription className="text-center">
									Don&apos;t have an account?{" "}
									<Link href="/sign-up">Sign up</Link>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
