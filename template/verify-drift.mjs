#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mapping = JSON.parse(await readFile(path.join(root, "template/source-map.json"), "utf8"));

async function listFiles(relative) {
  const files = [];
  for (const entry of await readdir(path.join(root, relative), { withFileTypes: true })) {
    const next = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(next));
    else if (entry.isFile()) files.push(next);
  }
  return files;
}

async function observedSourceFiles(candidate) {
  return (await Promise.all(candidate.watchedRoots.map((relative) => listFiles(relative)))).flat().sort();
}

async function inventoryHash(relative) {
  const hash = createHash("sha256");
  for (const file of (await listFiles(relative)).sort()) hash.update(file).update("\0").update(await readFile(path.join(root, file))).update("\0");
  return hash.digest("hex");
}

async function verifySourceMap(candidate, observed = undefined) {
  if (candidate.schemaVersion !== 1 || !Array.isArray(candidate.watchedRoots) || candidate.watchedRoots.length === 0 || !Array.isArray(candidate.watchedInventories) || !Array.isArray(candidate.entries) || candidate.entries.length === 0 || !Array.isArray(candidate.excludedSources)) {
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
  const excluded = new Set();
  for (const entry of candidate.excludedSources) {
    if (!entry.source || !entry.sourceHash || !entry.reason) throw new Error("Excluded source requires a path, hash and review reason");
    if (seenSources.has(entry.source) || excluded.has(entry.source)) throw new Error(`Source has multiple drift decisions: ${entry.source}`);
    excluded.add(entry.source);
    const info = await stat(path.join(root, entry.source));
    if (!info.isFile()) throw new Error(`Excluded source is not a file: ${entry.source}`);
    const actual = createHash("sha256").update(await readFile(path.join(root, entry.source))).digest("hex");
    if (actual !== entry.sourceHash) throw new Error(`Template exclusion review required for ${entry.source}: source changed from ${entry.sourceHash} to ${actual}`);
  }
  const actual = observed ?? await observedSourceFiles(candidate);
  const declared = [...seenSources, ...excluded].sort();
  const unknown = actual.filter((file) => !declared.includes(file));
  const missing = declared.filter((file) => !actual.includes(file));
  if (unknown.length > 0 || missing.length > 0) throw new Error(`Template source inventory review required. Untracked: ${unknown.join(", ") || "none"}; missing: ${missing.join(", ") || "none"}`);
  for (const inventory of candidate.watchedInventories) {
    if (!inventory.root || !inventory.hash || !inventory.strategy || !inventory.reviewRule) throw new Error("Watched inventory requires root, hash, strategy and review rule");
    const actualHash = await inventoryHash(inventory.root);
    if (actualHash !== inventory.hash) throw new Error(`Template capability inventory review required for ${inventory.root}: source changed from ${inventory.hash} to ${actualHash}`);
  }
  return { sources: seenSources.size, excluded: excluded.size, inventories: candidate.watchedInventories.length, targets: seenTargets.size };
}

if (process.argv.includes("--negative-fixture")) {
  const stale = structuredClone(mapping);
  stale.entries[0].sourceHash = "0".repeat(64);
  try { await verifySourceMap(stale); throw new Error("Stale source hash fixture unexpectedly passed"); }
  catch (error) {
    if (!String(error).includes("Template drift review required")) throw error;
    console.log("Template drift negative fixture rejected a stale source hash");
  }
  const actual = await observedSourceFiles(mapping);
  try { await verifySourceMap(mapping, [...actual, `${mapping.watchedRoots[0]}/unreviewed-capability.ts`].sort()); throw new Error("Untracked source fixture unexpectedly passed"); }
  catch (error) {
    if (!String(error).includes("source inventory review required")) throw error;
    console.log("Template drift negative fixture rejected an untracked capability source");
  }
  const staleInventory = structuredClone(mapping);
  staleInventory.watchedInventories[0].hash = "0".repeat(64);
  try { await verifySourceMap(staleInventory); throw new Error("Stale inventory fixture unexpectedly passed"); }
  catch (error) {
    if (!String(error).includes("capability inventory review required")) throw error;
    console.log("Template drift negative fixture rejected a changed Transform/Fold inventory");
  }
} else {
  const result = await verifySourceMap(mapping);
  console.log(`Template source drift gate verified ${result.sources} projected and ${result.excluded} explicitly excluded files plus ${result.inventories} Transform/Fold inventories across ${result.targets} projections`);
}
