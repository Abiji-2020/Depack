import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["fs", "path", "os", "child_process", "util"],
  outDir: "dist",
  splitting: false,
  minify: false,
  bundle: true,
  target: "node20",
  platform: "node",
});
