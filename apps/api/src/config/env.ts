import "dotenv/config";
import z from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "test", "production"]),
	PORT: z.coerce.number().default(3000),

	JWT_ACCESS_SECRET: z.string().min(1),
	JWT_REFRESH_SECRET: z.string().min(1),

	JWT_ACCESS_EXPIRES_IN: z.string(),
	JWT_REFRESH_EXPIRES_IN: z.string(),
});

export const env = envSchema.parse(process.env);
