import { parse } from "@babel/parser";
import fs from "fs";
import path from "path";
import traverse from "@babel/traverse";
import {
  detectProjectType,
  getPackageType,
  getPluginsFor,
  getSourceType,
} from "./pkgutils";

export const getUsedDependencies = (dir: string): Set<string> => {
  const usedDeps = new Set<string>();
  const files = readFilesRecursively(dir);

  files.forEach((file) => {
    console.log(`Processing file: ${file}`);
    if (!file.endsWith(".js") && !file.endsWith(".ts")) {
      console.warn(`Skipping non-JS/TS file: ${file}`);
      return;
    }
    console.log("The source is given as type of"+ getSourceType(file));
    const code = fs.readFileSync(file, "utf-8");
    const ast = parse(code, {
      sourceType: getSourceType(file),
      plugins: getPluginsFor(file, detectProjectType(dir)),
    });

    traverse(ast, {
      ImportDeclaration({ node }) {
        const dep = node.source.value.split("/")[0];
        if (dep.startsWith("@")) {
          const scopedDep = dep.split("/")[0] + "/" + dep.split("/")[1];
          usedDeps.add(scopedDep);
        } else {
          usedDeps.add(dep);
        }
      },
      CallExpression({ node }) {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "require"
        ) {
          const arg = node.arguments[0];
          if (arg && arg.type === "StringLiteral") {
            const dep = arg.value.split("/")[0];
            if (dep.startsWith("@")) {
              const scopedDep = dep.split("/")[0] + "/" + dep.split("/")[1];
              usedDeps.add(scopedDep);
            } else {
              usedDeps.add(dep);
            }
          }
        }
      },
    });
  });
console.log("Used dependencies:", Array.from(usedDeps).join(", "));
  return usedDeps;
};

const readFilesRecursively = (folder: string): string[] => {
  const entries = fs.readdirSync(folder, { withFileTypes: true, });

  return entries.flatMap((entry) => {
    if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "dist") {
      // Skip hidden files and directories
      return [];
    }
    const fullPath = path.join(folder, entry.name);
    if (entry.isDirectory()) {
      return readFilesRecursively(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      return fullPath;
    }
    return [];
  });
};
