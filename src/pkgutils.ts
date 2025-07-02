import fs from "fs";
import path from "path";
import * as babel from "@babel/core";
import { ParserPlugin } from "@babel/parser";

export function getDeclaredDepdencies(): string[] {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
  const deps = pkg.dependencies || {};
  const devDeps = pkg.devDependencies || {};
  const allDeps = { ...deps, ...devDeps };
  return Object.keys(allDeps).filter((dep) => !dep.startsWith("@types/"));
}

export function getPackageType(): string {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
  return pkg.type || "commonjs";
}

export type ProjectType = "next" | "vanilla" | "react" | "typescript" | "swc";

export function detectProjectType(projectRootDir: string): ProjectType {
  const has = (file: string) => fs.existsSync(path.join(projectRootDir, file));
  if (
    has("next.config.js") ||
    has("pages/_app.tsx") ||
    has("pages/_app.jsx") ||
    has("app/layout.tsx") ||
    has("app/layout.jsx") ||
    has("app/page.tsx") ||
    has("app/page.jsx")
  ) {
    return "next";
  }
  if (has("swcrc")) return "swc";
  if (has("tsconfig.json")) return "typescript";
  if (
    has("babel.config.js") ||
    has("babel.config.json") ||
    has(".babelrc") ||
    has(".babelrc.json")
  ) {
    return "react";
  }
  return "vanilla";
}

export function getSourceType(
  filePath: string,
  packageType: string = "commonjs",
): "module" | "script" {
  const ext = path.extname(filePath);
  if (ext === ".mjs" || ext === ".mts" || ext === ".ts" || ext === ".tsx" || ext === ".jsx") {
    return "module";
  }
  if (ext === ".cjs" || ext === ".cts") {
    return "script";
  }
  if (packageType === "module") {
    return "module";
  }
  return "script";
}

export function getPluginsFor(
  filePath: string,
  projectType: ProjectType,
): ParserPlugin[] {
  const basePlugins: ParserPlugin[] = [
    "dynamicImport",
    "optionalChaining",
    "nullishCoalescingOperator",
  ];
  const ext = path.extname(filePath);
  if (ext === ".ts" || ext === ".tsx") {
    basePlugins.push("typescript");
  }
  if (projectType === "react" || projectType === "next") {
    basePlugins.push("jsx", "classProperties", "objectRestSpread");
  }
  if (projectType === "next") {
    basePlugins.push("decorators-legacy");
  }
  if (projectType === "swc") {
    basePlugins.push(
      "decorators-legacy",
      "classProperties",
      "objectRestSpread",
    );
  }
  if (projectType === "typescript") {
    basePlugins.push("typescript");
  }
  if (projectType === "vanilla") {
    basePlugins.push("classProperties", "objectRestSpread");
  }
  return [...new Set(basePlugins)];
}
