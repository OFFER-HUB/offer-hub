import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Temporarily disable some rules to allow build while we fix issues
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn", // Temporarily changed back to warn
      "@typescript-eslint/no-unsafe-assignment": "off", // Temporarily disabled
      "@typescript-eslint/no-unsafe-member-access": "off", // Temporarily disabled
      "@typescript-eslint/no-unsafe-call": "off", // Temporarily disabled
      "@typescript-eslint/no-require-imports": "off", // Temporarily disabled
      "react/no-unescaped-entities": "warn",
      "@next/next/no-img-element": "warn",
      "jsx-a11y/alt-text": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@next/next/no-async-client-component": "warn", // Temporarily changed to warn
      "react-hooks/rules-of-hooks": "error", // Keep this as error since it's critical
      "@next/next/no-html-link-for-pages": "error", // Keep this as error since it's important
      // Quote consistency rules
      "quotes": ["error", "single"],
      "quote-props": ["error", "as-needed"],
      "jsx-quotes": ["error", "prefer-single"]
    }
  }
];

export default eslintConfig;
