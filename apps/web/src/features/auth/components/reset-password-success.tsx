import { Check } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";

export default function ResetPasswordSuccess() {
	return (
		<Card>
			<CardContent>
				<Empty className="w-full p-0">
					<EmptyHeader>
						<EmptyMedia>
							<Check />
						</EmptyMedia>
						<EmptyTitle>Password Reset!</EmptyTitle>
						<EmptyDescription>
							Your password has been reset successfully. Sign in with your new
							password to continue.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Link href="/sign-in" className={buttonVariants()}>
							Sign In
						</Link>
					</EmptyContent>
				</Empty>
			</CardContent>
		</Card>
	);
}
