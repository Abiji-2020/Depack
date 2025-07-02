import { parse } from "@babel/parser";
import fs from "fs";
import path from "path";
import traverse from "@babel/traverse";

export const getUsedDependenciesss = (dir: string): Set<string> => {
  const usedDeps = new Set<string>();
  const files = readFilesRecursively(dir);

  files.forEach((file) => {
    const code = fs.readFileSync(file, "utf-8");
    const ast = parse(code, {});

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

  return usedDeps;
};

const readFilesRecursively = (folder: string): string[] => {
  const entries = fs.readdirSync(folder, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(folder, entry.name);
    if (entry.isDirectory()) {
      return readFilesRecursively(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      return fullPath;
    }
    return [];
  });
};
