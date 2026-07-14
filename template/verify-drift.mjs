#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mapping = JSON.parse(await readFile(path.join(root, "template/source-map.json"), "utf8"));

async function verifySourceMap(candidate) {
  if (candidate.schemaVersion !== 1 || !Array.isArray(candidate.entries) || candidate.entries.length === 0) {
    throw new Error("Template source map is missing or invalid");
  }
  const seenSources = new Set();
  const seenTargets = new Set();
  for (const entry of candidate.entries) {
    if (seenSources.has(entry.source)) throw new Error(`Duplicate source mapping: ${entry.source}`);
    seenSources.add(entry.source);
    const bytes = await readFile(path.join(root, entry.source));
    const actual = createHash("sha256").update(bytes).digest("hex");
    if (actual !== entry.sourceHash) throw new Error(`Template drift review required for ${entry.source}: source changed from ${entry.sourceHash} to ${actual}`);
    if (!Array.isArray(entry.targets) || entry.targets.length === 0) throw new Error(`Source has no template projection: ${entry.source}`);
    for (const target of entry.targets) {
      if (seenTargets.has(target)) throw new Error(`Template target has multiple source owners: ${target}`);
      seenTargets.add(target);
      const info = await stat(path.join(root, target));
      if (!info.isFile()) throw new Error(`Template projection is not a file: ${target}`);
    }
  }
  return { sources: seenSources.size, targets: seenTargets.size };
}

if (process.argv.includes("--negative-fixture")) {
  const stale = structuredClone(mapping);
  stale.entries[0].sourceHash = "0".repeat(64);
  try { await verifySourceMap(stale); throw new Error("Stale source hash fixture unexpectedly passed"); }
  catch (error) {
    if (!String(error).includes("Template drift review required")) throw error;
    console.log("Template drift negative fixture rejected a stale source hash");
  }
} else {
  const result = await verifySourceMap(mapping);
  console.log(`Template source drift gate verified ${result.sources} capability sources and ${result.targets} projections`);
}
