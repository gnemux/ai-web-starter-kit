#!/usr/bin/env node
import path from "node:path";
import { hashTree } from "./lib.mjs";

const [first, second] = process.argv.slice(2).filter((arg) => arg !== "--");
if (!first || !second) {
  console.error("Usage: pnpm template:compare -- /first/candidate /second/candidate");
  process.exit(2);
}
const firstHash = await hashTree(path.resolve(first));
const secondHash = await hashTree(path.resolve(second));
if (firstHash !== secondHash) {
  console.error(`Candidates differ: ${firstHash} != ${secondHash}`);
  process.exit(1);
}
console.log(`Candidates are identical: ${firstHash}`);
