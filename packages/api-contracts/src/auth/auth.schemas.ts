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

export const forgotPasswordSchema = z.object({
	email: z.email("Invalid email address"),
});

export const tokenSchema = z.object({
	token: z.string().min(1, "Token is required"),
});

export const resetPasswordSchema = z
	.object({
		token: z.string().min(1, "Token is required"),
		newPassword: passwordSchema,
		confirmPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		path: ["confirmPassword"],
		error: "Password do not match",
	});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type TokenInput = z.infer<typeof tokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
