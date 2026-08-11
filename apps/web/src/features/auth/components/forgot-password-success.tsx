"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { useCountdown } from "@/hooks/use-countdown";
import { useForgotPassword } from "../hooks/use-forgot-password";

interface ForgotPasswordSuccessProps {
	email: string;
	countdown?: number;
}

export function ForgotPasswordSuccess({
	email,
	countdown,
}: ForgotPasswordSuccessProps) {
	const { remaining, isRunning, restart } = useCountdown({
		initialSeconds: countdown ?? 60,
	});
	const resendMutation = useForgotPassword();

	const handleResend = () => {
		resendMutation.mutate(
			{
				email,
			},
			{
				onSuccess: () => {
					restart();
					toast.add({
						type: "success",
						title:
							"If an account with that email exists, we've sent another reset link.",
					});
				},
			},
		);
	};

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Check your email</CardTitle>
					<CardDescription>
						If an account with that email exists, We&apos;ve sent a password
						reset link.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Field>
						<FieldDescription className="text-center">
							Didn&apos;t receive the email?
						</FieldDescription>
						{isRunning ? (
							<Button disabled>Resend in ({remaining}s)</Button>
						) : (
							<Button
								onClick={handleResend}
								disabled={resendMutation.isPending}
							>
								Resend Email
							</Button>
						)}
						<FieldDescription className="text-center">
							Back to <Link href="/sign-in">Sign In</Link>
						</FieldDescription>
					</Field>
				</CardContent>
			</Card>
		</div>
	);
}
