import z from "zod";

const passwordSchema = z
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

export const registerSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(2, "Name must be at least 2 characters")
			.max(100, "Name must be at most 100 characters"),
		email: z
			.email("Invalid email address")
			.transform((email) => email.toLowerCase()),
		password: passwordSchema,
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		error: "Password do not match",
	});

export const loginSchema = z.object({
	email: z.email("Invalid email address"),
	password: z.string(),
});

export type RegisterInput = Omit<
	z.infer<typeof registerSchema>,
	"confirmPassword"
>;
export type LoginInput = z.infer<typeof loginSchema>;
