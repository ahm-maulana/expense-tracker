import { describe, expect, it, vi } from "vitest";
import { emailService } from "../../common/email/email.service.js";
import { sendPasswordResetEmail } from "./auth-email.service.js";

vi.mock("../../common/email/email.service.js");

describe("Auth Email Service", () => {
	describe("sendPasswordRestEmail", () => {
		it("should send password reset email", async () => {
			await sendPasswordResetEmail({
				to: "john@example.com",
				token: "random-token",
			});

			expect(emailService.send).toHaveBeenCalledWith({
				to: "john@example.com",
				subject: "Reset your password",
				html: expect.stringContaining("random-token"),
			});
		});
	});
});
