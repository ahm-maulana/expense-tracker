import { describe, expect, it, vi } from "vitest";
import { resend } from "../../../lib/resend.js";
import { EmailProviderError } from "../../errors/app-error.js";
import { ResendProvider } from "./resend.provider.js";

vi.mock("../../../lib/resend.ts", () => ({
	resend: {
		emails: {
			send: vi.fn().mockResolvedValue({
				data: {
					id: "email-id",
				},
				error: null,
			}),
		},
	},
}));

describe("Resend Provider", () => {
	const provider = new ResendProvider();

	it("should send email", async () => {
		await provider.send({
			to: "john@example.com",
			subject: "Reset password email",
			html: "html template",
		});

		expect(resend.emails.send).toHaveBeenCalled();
	});

	it("should throw EmailProviderError when resend returns an error", async () => {
		vi.mocked(resend.emails.send).mockResolvedValue({
			data: null,
			error: {
				message: "API Error",
				statusCode: 500,
				name: "validation_error",
			},
			headers: {},
		});

		await expect(
			provider.send({
				to: "john@example.com",
				subject: "Reset password email",
				html: "html template",
			}),
		).rejects.toThrow(EmailProviderError);
	});
});
