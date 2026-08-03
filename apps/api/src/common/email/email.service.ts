import type { SendEmailOptions } from "./email.types.js";
import { ResendProvider } from "./providers/resend.provider.js";

const provider = new ResendProvider();

export const emailService = {
	send: (options: SendEmailOptions) => provider.send(options),
};
