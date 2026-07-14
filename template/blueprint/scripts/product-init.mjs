#!/usr/bin/env node
import { readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { configHash, generatedProductModule, generatedSupabaseConfig, productState, validateProductConfig } from "./product-config.mjs";

const root = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const valueFor = (name) => { const index = args.indexOf(name); return index >= 0 ? args[index + 1] : undefined; };
const input = valueFor("--config") ?? path.join(root, "product.config.json");

const absoluteInput = path.resolve(input);
if (absoluteInput === root || absoluteInput.startsWith(`${root}${path.sep}node_modules${path.sep}`)) throw new Error("Product config path is unsafe");
const config = validateProductConfig(JSON.parse(await readFile(absoluteInput, "utf8")));
const version = JSON.parse(await readFile(path.join(root, "template-version.json"), "utf8"));
const currentState = JSON.parse(await readFile(path.join(root, "product-state.json"), "utf8"));
const nextHash = configHash(config);
if (currentState.status === "derived" && nextHash !== currentState.configHash && !args.includes("--force")) {
  throw new Error("Product is already derived; pass --force to replace its identity intentionally");
}

const outputs = new Map([
  [path.join(root, "product.config.json"), `${JSON.stringify(config, null, 2)}\n`],
  [path.join(root, "apps/web/config/product.config.ts"), generatedProductModule(config, version.candidateVersion)],
  [path.join(root, "supabase/config.toml"), generatedSupabaseConfig(config)],
  [path.join(root, "product-state.json"), `${JSON.stringify(productState(config, version.candidateVersion, "derived"), null, 2)}\n`],
]);
const originals = new Map(await Promise.all([...outputs.keys()].map(async (file) => [file, await readFile(file)])));
const staged = new Map([...outputs.keys()].map((file, index) => [file, `${file}.product-init-${process.pid}-${index}`]));
try {
  await Promise.all([...outputs].map(([file, value]) => writeFile(staged.get(file), value, { flag: "wx" })));
  for (const file of outputs.keys()) await rename(staged.get(file), file);
} catch (error) {
  await Promise.all([...originals].map(([file, value]) => writeFile(file, value)));
  await Promise.all([...staged.values()].map((file) => rm(file, { force: true })));
  throw error;
}
console.log(`Initialized ${config.identity.name} (${config.identity.id}) from template ${version.candidateVersion}`);
