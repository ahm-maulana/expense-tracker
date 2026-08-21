import "dotenv/config";
import z from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "test", "production"]),
	WEB_APP_URL: z.string().default("http://localhost:3001"),
	PORT: z.coerce.number().default(3000),

	JWT_ACCESS_SECRET: z.string().min(1),
	JWT_REFRESH_SECRET: z.string().min(1),

	JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
	JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

	TOKEN_SECRET: z.string().min(1),

	RESEND_API_KEY: z.string().min(1),
});

export const env = envSchema.parse(process.env);
