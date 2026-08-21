import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		projects: [
			{
				extends: true,
				test: {
					name: "unit",
					include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
					environment: "jsdom",
				},
			},
			{
				extends: true,
				test: {
					name: "integration",
					include: [
						"tests/integration/**/*.integration.test.ts",
						"tests/integration/**/*.integration.test.tsx",
					],
					environment: "jsdom",
					setupFiles: ["./tests/setup.ts"],
				},
			},
		],
	},
});
