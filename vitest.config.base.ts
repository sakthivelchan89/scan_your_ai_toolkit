import { defineConfig } from "vitest/config";

/**
 * Shared vitest configuration for all @maiife-ai-pub/* packages.
 *
 * Per-package vitest.config.ts files should import and spread this:
 *
 *   import { defineConfig, mergeConfig } from "vitest/config";
 *   import baseConfig from "../../vitest.config.base";
 *
 *   export default mergeConfig(baseConfig, defineConfig({
 *     test: {
 *       // package-specific overrides
 *     }
 *   }));
 */
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
    exclude: ["node_modules", "dist", "**/*.conformance.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.d.ts",
        "src/cli/**",
        "src/mcp/**",
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 65,
        statements: 70,
      },
    },
  },
});
