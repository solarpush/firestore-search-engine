import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.cjs",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "dist/index.mjs",
      format: "esm",
      sourcemap: true,
    },
  ],
  external: [
    "@google-cloud/firestore",
    "@types/express",
    "@types/node",
    "firebase-functions",
    "firebase-functions/https",
    "fastembed",
  ],
  plugins: [typescript(), terser()],
};
