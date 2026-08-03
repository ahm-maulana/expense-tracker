import { resend } from "../../../lib/resend.js";
import { EmailProviderError } from "../../errors/app-error.js";
import type { EmailProvider, SendEmailOptions } from "../email.types.js";

export class ResendProvider implements EmailProvider {
	async send(options: SendEmailOptions): Promise<void> {
		const { error } = await resend.emails.send({
			from: "Expense Tracker <noreply@mail.ahmadmaulana.com>",
			to: options.to,
			subject: options.subject,
			html: options.html,
		});

		if (error) {
			throw new EmailProviderError(error.message);
		}
	}
}
