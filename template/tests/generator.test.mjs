import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, realpath, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { assertArtifactInventory, assertGenerationMode, assertInventory, assertSafeOutput, hashTree, hashTreeWithOverrides, scanCandidate, validateManifest, validateProductConfig } from "../lib.mjs";
import schema from "../manifest.schema.json" with { type: "json" };
import manifest from "../manifest.json" with { type: "json" };
import product from "../default-product.json" with { type: "json" };

test("manifest and default product satisfy strict schemas", () => {
  assert.equal(validateManifest(manifest, schema), manifest);
  assert.equal(validateProductConfig(product), product);
});

test("unknown or missing blueprint input fails closed", () => {
  assert.throws(() => assertInventory(["a", "unknown"], ["a"]), /inventory mismatch/i);
  assert.throws(() => assertInventory(["a"], ["a", "missing"]), /inventory mismatch/i);
});

test("every concrete candidate artifact has a unique typed source and target", () => {
  const copies = manifest.artifacts.filter((entry) => entry.action === "copy");
  const files = copies.map((entry) => entry.source.slice("template/blueprint/".length));
  assert.equal(assertArtifactInventory(files, manifest.artifacts).length, copies.length);
  assert.throws(() => assertArtifactInventory(files, [...manifest.artifacts, manifest.artifacts[0]]), /unique/);
});

test("allow-dirty cannot create a candidate", () => {
  assert.throws(() => assertGenerationMode({ dryRun: false, allowDirty: true }), /only with --dry-run/);
  assert.doesNotThrow(() => assertGenerationMode({ dryRun: true, allowDirty: true }));
});

test("product identity and internal paths are bounded", () => {
  assert.throws(() => validateProductConfig({ ...product, identity: { ...product.identity, id: "Bad ID" } }), /Invalid product config/);
  assert.throws(() => validateProductConfig({ ...product, home: { ...product.home, primaryHref: "//evil.example" } }), /Invalid product config/);
  assert.throws(() => validateProductConfig({ ...product, paths: { ...product.paths, product: "/\\\\evil.example" } }), /Invalid product config/);
});

test("manifest schema rejects undeclared fields and empty inventories", () => {
  assert.throws(() => validateManifest({ ...manifest, extra: true }, schema), /Invalid template manifest/);
  assert.throws(() => validateManifest({ ...manifest, artifacts: [] }, schema), /Invalid template manifest/);
});

test("secret-shaped values are rejected anywhere in the candidate tree", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "candidate-secret-"));
  try {
    await mkdir(path.join(root, "docs"));
    await writeFile(path.join(root, "docs", "README.md"), "SERVICE_ROLE_KEY=sb_secret_abcdefghijklmnopqrstuvwxyz\n");
    await assert.rejects(() => scanCandidate(root), /Secret-shaped value/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("product paths, execution history, binary files and build residue fail pollution scanning", async () => {
  for (const fixture of [
    { path: "catcare/private.ts", value: "export {}\n", pattern: /Product path pollution/ },
    { path: "notes.md", value: "GNE-302 PR #99\n", pattern: /execution-history/ },
    { path: "asset.bin", value: Buffer.from([0xff, 0xfe, 0xfd]), pattern: /binary/ },
    { path: ".next/output", value: "generated\n", pattern: /residue/ }
  ]) {
    const root = await mkdtemp(path.join(os.tmpdir(), "candidate-pollution-"));
    try {
      await mkdir(path.dirname(path.join(root, fixture.path)), { recursive: true });
      await writeFile(path.join(root, fixture.path), fixture.value);
      await assert.rejects(() => scanCandidate(root), fixture.pattern);
    } finally { await rm(root, { recursive: true, force: true }); }
  }
});

test("internal, non-empty and symlink outputs fail closed", async () => {
  const root = await realpath(await mkdtemp(path.join(os.tmpdir(), "candidate-output-")));
  try {
    const source = path.join(root, "source");
    const external = path.join(root, "external");
    await mkdir(source);
    await mkdir(external);
    await writeFile(path.join(external, "existing"), "x");
    await assert.rejects(() => assertSafeOutput(source, path.join(source, "child")), /outside/);
    await assert.rejects(() => assertSafeOutput(source, external), /must not already contain/);
    const target = path.join(root, "target");
    await mkdir(target);
    const linked = path.join(root, "linked");
    await symlink(target, linked);
    await assert.rejects(() => assertSafeOutput(source, path.join(linked, "candidate")), /symbolic link/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("normalized tree hashing is deterministic", async () => {
  const first = await mkdtemp(path.join(os.tmpdir(), "candidate-hash-a-"));
  const second = await mkdtemp(path.join(os.tmpdir(), "candidate-hash-b-"));
  try {
    await writeFile(path.join(first, "a.txt"), "same\n");
    await writeFile(path.join(second, "a.txt"), "same\n");
    assert.equal(await hashTree(first), await hashTree(second));
  } finally {
    await rm(first, { recursive: true, force: true });
    await rm(second, { recursive: true, force: true });
  }
});

test("post-build verification ignores only declared reproducible artifacts", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "candidate-artifacts-"));
  try {
    await writeFile(path.join(root, "source.txt"), "kept\n");
    await writeFile(path.join(root, "cache.tsbuildinfo"), "ignored\n");
    await mkdir(path.join(root, ".next"));
    await writeFile(path.join(root, ".next", "output"), "ignored\n");
    await mkdir(path.join(root, ".temp"));
    await writeFile(path.join(root, ".temp", "tool-state"), "ignored\n");
    const all = await (await import("../lib.mjs")).listFiles(root);
    const postBuild = await (await import("../lib.mjs")).listFiles(root, "", { ignoreBuildArtifacts: true });
    assert.deepEqual(all.sort(), [".next/output", ".temp/tool-state", "cache.tsbuildinfo", "source.txt"]);
    assert.deepEqual(postBuild, ["source.txt"]);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("hash overrides retain provenance for an approved generated declaration", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "candidate-override-"));
  try {
    await writeFile(path.join(root, "file.txt"), "generated\n");
    assert.equal(await hashTreeWithOverrides(root, ["file.txt"], new Map([["file.txt", Buffer.from("source\n")]])), await (async () => {
      await writeFile(path.join(root, "file.txt"), "source\n");
      return hashTree(root);
    })());
  } finally { await rm(root, { recursive: true, force: true }); }
});
