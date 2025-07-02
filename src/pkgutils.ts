import fs from "fs";

export function getDeclaredDepdencies(): string[] {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
  const deps = pkg.dependencies || {};
  const devDeps = pkg.devDependencies || {};
  const allDeps = { ...deps, ...devDeps };
  return Object.keys(allDeps).filter((dep) => !dep.startsWith("@types/"));
}
