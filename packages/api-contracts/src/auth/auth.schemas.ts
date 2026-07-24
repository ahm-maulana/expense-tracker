import z from "zod";
import { passwordSchema } from "../common/schemas.js";

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

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
