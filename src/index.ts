#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { getDeclaredDepdencies } from "./pkgutils";
import { getUsedDependencies } from "./scanner";

const program = new Command();

program
  .name("depack")
  .description(
    "A tool to analyze and report unused dependencies in a Node.js project",
  )
  .option("-d , --dir <directory path> ", "Directory to scan", ".")
  .parse();

const options = program.opts();
const usedDeps = getUsedDependencies(options.dir);
console.log(chalk.blue("Used dependencies:"));
usedDeps.forEach((dep) => console.log(chalk.green(dep)));
const declaredDeps = getDeclaredDepdencies();

const unusedDeps = declaredDeps.filter((dep) => !usedDeps.has(dep));

if (unusedDeps.length > 0) {
  console.log(chalk.red("Unused dependencies found:"));
  unusedDeps.forEach((dep) => console.log(chalk.yellow(dep)));
} else {
  console.log(chalk.green("No unused dependencies found."));
}
