export interface EmailProvider {
	send(options: SendEmailOptions): Promise<void>;
}

export interface SendEmailOptions {
	to: string;
	subject: string;
	html: string;
}
