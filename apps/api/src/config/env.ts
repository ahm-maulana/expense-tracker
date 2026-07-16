import "dotenv/config";

export const env = {
	PORT: process.env.PORT ?? 3001,
	NODE_ENV: process.env.NODE_ENV ?? "development",
};
