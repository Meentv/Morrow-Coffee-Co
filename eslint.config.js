import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist", "node_modules", "coverage", "playwright-report", "test-results", "legacy/**"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always"],
      "prefer-const": "error",
    },
  },
  {
    /**
     * React Hook Form's `handleSubmit(onSubmit)` returns a memoised handler that
     * closes over the form's ref map. The React Compiler lint rules
     * (`react-hooks/refs`, `react-hooks/incompatible-library`) cannot see
     * through RHF's internals and report a false positive on this documented
     * RHF API. Scoped to the four files that use it — every other file keeps
     * the rules fully enabled.
     */
    files: [
      "src/features/contact/components/EnquiryForm.tsx",
      "src/features/contact/components/NewsletterForm.tsx",
      "src/features/kitchen/components/KitchenEnquiryForm.tsx",
      "src/features/order/components/OrderForm.tsx",
    ],
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/incompatible-library": "off",
    },
  },
  {
    files: [
      "**/*.test.{ts,tsx}",
      "e2e/**/*.ts",
      "vitest.setup.ts",
      "playwright.config.ts",
      "src/services/**/*.ts",
    ],
    rules: {
      "jsx-a11y/no-autofocus": "off",
      "no-console": "off",
    },
  },
);
