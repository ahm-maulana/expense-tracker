"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@repo/api-contracts";
import { AlertCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import type z from "zod";
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
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useRegister } from "../hooks/use-register";

export function RegisterForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const router = useRouter();
	const registerMutation = useRegister();
	const form = useForm<z.infer<typeof registerSchema>>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: "John Doe",
			email: "john@example.com",
			password: "Password123@",
			confirmPassword: "Password123@",
		},
	});

	function onSubmit(data: z.infer<typeof registerSchema>) {
		registerMutation.mutate(data, {
			onSuccess: () => {
				toast.add({
					type: "success",
					description: "Account created successfully. Please sign in.",
				});
				router.push("/sign-in");
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
					<CardTitle>Create your Account</CardTitle>
					<CardDescription>
						Create your account and take control of your financial journey.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{form.formState.errors.root && (
						<Alert variant="destructive" className="max-w-md mb-4">
							<AlertCircleIcon />
							<AlertTitle>{form.formState.errors.root.message}</AlertTitle>
						</Alert>
					)}
					<form onSubmit={form.handleSubmit(onSubmit)} noValidate>
						<FieldGroup>
							<Controller
								name="name"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field>
										<FieldLabel htmlFor="name">Name</FieldLabel>
										<Input
											{...field}
											id="name"
											aria-invalid={fieldState.invalid}
											placeholder="John Doe"
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>

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

							<Controller
								name="confirmPassword"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field>
										<div className="flex items-center">
											<FieldLabel htmlFor="confirmPassword">
												Confirmation Password
											</FieldLabel>
										</div>
										<Input
											{...field}
											id="confirmPassword"
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
								<Button type="submit">
									{registerMutation.isPending
										? "Creating account..."
										: "Sign Up"}
								</Button>
								<FieldDescription className="text-center">
									Already have an account? <Link href="/sign-in">Sign in</Link>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
