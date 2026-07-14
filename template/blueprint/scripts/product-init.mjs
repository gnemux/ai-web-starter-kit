#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { configHash, generatedProductModule, generatedSupabaseConfig, productState, validateProductConfig } from "./product-config.mjs";

const root = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const valueFor = (name) => { const index = args.indexOf(name); return index >= 0 ? args[index + 1] : undefined; };
const input = valueFor("--config");
if (!input) throw new Error("Usage: pnpm product:init -- --config /path/product.json [--force]");

const absoluteInput = path.resolve(input);
if (absoluteInput === root || absoluteInput.startsWith(`${root}${path.sep}node_modules${path.sep}`)) throw new Error("Product config path is unsafe");
const config = validateProductConfig(JSON.parse(await readFile(absoluteInput, "utf8")));
const version = JSON.parse(await readFile(path.join(root, "template-version.json"), "utf8"));
const currentState = JSON.parse(await readFile(path.join(root, "product-state.json"), "utf8"));
const currentConfig = JSON.parse(await readFile(path.join(root, "product.config.json"), "utf8"));
const nextHash = configHash(config);
if (currentState.status === "derived" && nextHash !== configHash(currentConfig) && !args.includes("--force")) {
  throw new Error("Product is already derived; pass --force to replace its identity intentionally");
}

await writeFile(path.join(root, "product.config.json"), `${JSON.stringify(config, null, 2)}\n`);
await writeFile(path.join(root, "apps/web/config/product.config.ts"), generatedProductModule(config, version.candidateVersion));
await writeFile(path.join(root, "supabase/config.toml"), generatedSupabaseConfig(config));
await writeFile(path.join(root, "product-state.json"), `${JSON.stringify(productState(config, version.candidateVersion, "derived"), null, 2)}\n`);
console.log(`Initialized ${config.identity.name} (${config.identity.id}) from template ${version.candidateVersion}`);
