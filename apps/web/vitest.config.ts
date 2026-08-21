import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom", // This provides the DOM API (document, window, etc.)
		globals: true,
		setupFiles: [],
		include: ["**/*.test.{ts,tsx}"],
		exclude: ["node_modules", "dist"],
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
