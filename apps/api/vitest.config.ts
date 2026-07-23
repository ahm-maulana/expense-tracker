import dotenv from "dotenv";
import { defineConfig } from "vitest/config";

dotenv.config({
	path: ".env.test",
});

export default defineConfig({
	test: {
		globals: true,
		projects: [
			{
				test: {
					name: "unit",
					include: ["src/**/*.test.ts"],
					exclude: ["src/tests/**"],
					environment: "node",
				},
			},
			{
				test: {
					name: "integration",
					include: ["src/tests/integration/**/*.test.ts"],
					setupFiles: ["src/tests/helpers/setup.ts"],
					environment: "node",
					fileParallelism: false,
				},
			},
		],
		exclude: ["dist/**", "node_modules/**", "coverage/**"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
		},
	},
});
