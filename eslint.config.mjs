import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Base Next.js + TypeScript rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Ignore generated/vendor code
  {
    ignores: [
      "src/generated/**",
      "src/generated/prisma/**",
      "node_modules/**",
    ],
  },
];

export default eslintConfig;
