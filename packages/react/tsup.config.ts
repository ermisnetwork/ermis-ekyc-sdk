import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "ermis-ekyc-sdk",
    "@ermis-network/ermis-classroom-sdk",
    "@ermis-network/ermis-classroom-react",
  ],
  // Enable CSS modules – .module.css files get scoped class names
  // CSS is extracted to a separate file (dist/index.css)
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
});
