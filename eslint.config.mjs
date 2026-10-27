import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // Registry components (KaraUI, shadcn) are kept as published so they can be re-pulled;
    // React Compiler findings there are reported but do not fail the lint gate.
    files: ["src/components/motion/**", "src/components/ui/**", "src/lib/hooks/**"],
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "public/vendor/**",
      "storage/**",
    ],
  },
];

export default eslintConfig;
