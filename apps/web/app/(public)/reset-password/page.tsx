import ResetPasswordContent from "@/features/auth/components/reset-password-content";
import { ResetPasswordInvalid } from "@/features/auth/components/reset-password-invalid";

type Props = {
	searchParams: Promise<{
		token?: string;
	}>;
};

export default async function Page({ searchParams }: Props) {
	const { token } = await searchParams;

	if (!token) {
		return (
			<div className="w-full max-w-sm">
				<ResetPasswordInvalid />
			</div>
		);
	}

	return (
		<div className="w-full max-w-sm">
			<ResetPasswordContent token={token} />
		</div>
	);
}
