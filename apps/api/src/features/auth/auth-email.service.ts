import { emailService } from "../../common/email/email.service.js";
import { emailVerificationTemplate } from "../../common/email/templates/email-verificaiton.template.js";
import { env } from "../../config/env.js";

export interface SendPasswordResetEmailInput {
	to: string;
	token: string;
}

export async function sendPasswordResetEmail({
	to,
	token,
}: SendPasswordResetEmailInput): Promise<void> {
	const resetLink = `${env.APP_URL}/reset-password?token=${token}`;

	await emailService.send({
		to,
		subject: "Reset your password",
		html: emailVerificationTemplate(resetLink),
	});
}
