"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription } from "@/components/ui/field";

export function ResetPasswordInvalid() {
	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Invalid Reset Link</CardTitle>
					<CardDescription>
						This password reset link is invalid or has expired.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Field>
						<Link href="/forgot-password" className={buttonVariants()}>
							Request New Reset Link
						</Link>
						<FieldDescription className="text-center">
							Remember your password? <Link href="/sign-in">Sign in</Link>
						</FieldDescription>
					</Field>
				</CardContent>
			</Card>
		</div>
	);
}
