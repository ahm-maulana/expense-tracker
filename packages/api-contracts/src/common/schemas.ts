import z from "zod";

export const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters")
	.max(16, "Password must be at most 16 characters")
	.refine((pwd) => /[A-Z]/.test(pwd), {
		error: "Password must contain at least one uppercase letter (A-Z)",
	})
	.refine((pwd) => /[a-z]/.test(pwd), {
		error: "Password must contain at least one lowercase letter (a-z)",
	})
	.refine((pwd) => /[0-9]/.test(pwd), {
		error: "Password must contain at least one number (0-9)",
	})
	.refine((pwd) => /[!@#$%^&*?]/.test(pwd), {
		error: "Password must contain at least one special character (!@#$%^&*?)",
	});
