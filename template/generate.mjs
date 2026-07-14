#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateCandidate } from "./lib.mjs";

const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const valueFor = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const output = valueFor("--output");
if (!output) {
  console.error("Usage: pnpm template:generate -- --output /absolute/outside/path [--config /path/product.json] [--dry-run] [--allow-dirty]");
  process.exit(2);
}

try {
  const result = await generateCandidate({
    sourceRoot,
    outputRoot: output,
    configFile: valueFor("--config"),
    dryRun: args.includes("--dry-run"),
    allowDirty: args.includes("--allow-dirty")
  });
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
