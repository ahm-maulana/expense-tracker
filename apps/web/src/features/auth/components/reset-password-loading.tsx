import { Card, CardContent } from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

export default function ResetPasswordLoading() {
	return (
		<Card>
			<CardContent>
				<Empty className="w-full p-0">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Spinner />
						</EmptyMedia>
						<EmptyTitle>Verifying security token...</EmptyTitle>
						<EmptyDescription>
							Please wait while we verify your reset password request. This will
							only take a moment.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</CardContent>
		</Card>
	);
}
