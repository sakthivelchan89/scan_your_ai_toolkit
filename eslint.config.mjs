import js from "@eslint/js";
import tseslint from "typescript-eslint";
import security from "eslint-plugin-security";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  security.configs.recommended,
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/*.js",
      "**/*.d.ts",
    ],
  },
  {
    rules: {
      // Security rules (from eslint-plugin-security)
      // detect-non-literal-fs-filename: all flagged cases use constant paths from os.homedir() / __dirname,
      // not user-controlled input — disabled to reduce false positive noise.
      "security/detect-non-literal-fs-filename": "off",
      // detect-object-injection: all flagged cases use Map/Set patterns, not dynamic property access on user input.
      "security/detect-object-injection": "off",
      "security/detect-non-literal-regexp": "warn",
      "security/detect-possible-timing-attacks": "warn",
      "security/detect-pseudoRandomBytes": "error",
      "security/detect-eval-with-expression": "error",
      "security/detect-new-buffer": "error",
      "security/detect-child-process": "warn",
      "security/detect-disable-mustache-escape": "error",
      "security/detect-no-csrf-before-method-override": "error",
      "security/detect-unsafe-regex": "error",

      // TypeScript quality
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-floating-promises": "error",

      // Disable overly noisy rules for this codebase
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    files: ["packages/*/src/**/*.ts"],
  },
);
