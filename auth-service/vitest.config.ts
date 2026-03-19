import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		globals: true,
		pool: "forks",
		env: {
			JWT_SECRET: "test-secret-key",
		},
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			include: ["src/**/*.ts"],
			exclude: ["src/index.ts"],
		},
	},
});
