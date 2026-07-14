#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { assertCandidateLayers, hashTreeWithOverrides, isProductEditablePath, listFiles, readJson, scanCandidate, sha256 } from "./lib.mjs";

const candidate = path.resolve(process.argv.slice(2).filter((arg) => arg !== "--")[0] ?? "");
if (!candidate || candidate === process.cwd()) {
  console.error("Usage: pnpm template:verify -- /absolute/candidate/path");
  process.exit(2);
}
const version = await readJson(path.join(candidate, "template-version.json"));
const manifest = await readJson(path.join(candidate, "template-manifest.json"));
await scanCandidate(candidate, { ignoreBuildArtifacts: true });
const lockHash = sha256(await readFile(path.join(candidate, "pnpm-lock.yaml")));
if (lockHash !== version.hashes.candidateLock) throw new Error("Candidate lockfile provenance mismatch");
const files = (await listFiles(candidate, "", { ignoreBuildArtifacts: true })).filter((file) => file !== "template-version.json");
const layers = assertCandidateLayers([...files, "template-version.json"], manifest);
const protectedFiles = layers.protectedFiles.filter((file) => file !== "template-version.json");
const nextEnvPath = "apps/web/next-env.d.ts";
const sourceNextEnv = await readFile(new URL("./blueprint/apps/web/next-env.d.ts", import.meta.url));
const currentNextEnv = await readFile(path.join(candidate, nextEnvPath), "utf8");
const generatedNextEnv = `${sourceNextEnv.toString()}/// <reference path="./.next/types/routes.d.ts" />\n\n// NOTE: This file should not be edited\n// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.\n`;
if (currentNextEnv !== sourceNextEnv.toString() && currentNextEnv !== generatedNextEnv) throw new Error("Next environment declaration contains an unapproved change");
const current = await hashTreeWithOverrides(candidate, protectedFiles, new Map([[nextEnvPath, sourceNextEnv]]));
if (current !== version.hashes.protectedContent) throw new Error("Protected candidate foundation differs from generated provenance");
console.log(`Candidate verified: ${version.product.id} ${version.candidateVersion}; protected=${protectedFiles.length}; product=${files.filter((file) => isProductEditablePath(file, manifest)).length}`);
