#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { getDeclaredDepdencies } from "./pkgutils";
import { getUsedDependenciesss } from "./scanner";

const program = new Command();

program
  .name("depack")
  .description(
    "A tool to analyze and report unused dependencies in a Node.js project",
  )
  .option("-d , --dir <directory path> ", "Directory to scan", ".")
  .parse();

const options = program.opts();
const usedDeps = getUsedDependenciesss(options.dir);
const declaredDeps = getDeclaredDepdencies();

const unusedDeps = declaredDeps.filter((dep) => !usedDeps.has(dep));

if (unusedDeps.length > 0) {
  console.log(chalk.red("Unused dependencies found:"));
  unusedDeps.forEach((dep) => console.log(chalk.yellow(dep)));
} else {
  console.log(chalk.green("No unused dependencies found."));
}
