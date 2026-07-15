import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, readFile, realpath, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { assertArtifactInventory, assertCandidateLayers, assertGenerationMode, assertInventory, assertSafeOutput, hashTree, hashTreeWithOverrides, isProductEditablePath, scanCandidate, validateManifest, validateProductConfig } from "../lib.mjs";
import schema from "../manifest.schema.json" with { type: "json" };
import manifest from "../manifest.json" with { type: "json" };
import product from "../default-product.json" with { type: "json" };
import { generatedProductModule, generatedSupabaseConfig, productState } from "../blueprint/scripts/product-config.mjs";
import { initializeProduct } from "../blueprint/scripts/product-init-lib.mjs";

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

test("generated config stays narrow while declared product roots remain editable", () => {
  assert.deepEqual([...manifest.productConfigAllowedChanges].sort(), [
    "apps/web/config/product.config.ts",
    "product-state.json",
    "product.config.json",
    "supabase/config.toml"
  ]);
  const layers = assertCandidateLayers([
    ...manifest.artifacts.map((entry) => entry.target),
    "apps/web/app/(product)/product/activity/page.tsx",
    "apps/web/modules/product/customer-journey.ts",
    "apps/web/public/product/brand.svg",
    "specs/product/product-spec.md",
    "tests/product/product-flow.test.mjs",
    "supabase/migrations/20260714000000_product_feature.sql"
  ], manifest);
  assert.ok(layers.productFiles.includes("apps/web/modules/product/customer-journey.ts"));
  assert.ok(layers.productFiles.includes("apps/web/modules/product/product-workspace.tsx"));
  assert.ok(layers.productFiles.includes("apps/web/app/(product)/product/activity/page.tsx"));
  assert.equal(isProductEditablePath("tests/foundation/template-smoke.spec.ts", manifest), false);
  assert.equal(isProductEditablePath("tests/product/product-flow.test.mjs", manifest), true);
  assert.equal(isProductEditablePath("apps/web/modules/platform/auth/actions.ts", manifest), false);
  assert.ok(layers.protectedFiles.includes(manifest.foundation.migrationFile));
  assert.ok(layers.protectedFiles.includes("supabase/tests/foundation_test.sql"));
  assert.throws(() => assertCandidateLayers([...manifest.artifacts.map((entry) => entry.target), "packages/core/src/product-hack.ts"], manifest), /undeclared files outside product roots/);
  assert.throws(() => assertCandidateLayers(manifest.artifacts.map((entry) => entry.target).filter((file) => file !== manifest.foundation.migrationFile), manifest), /Missing protected files/);
  assert.throws(() => assertCandidateLayers(manifest.artifacts.map((entry) => entry.target).filter((file) => file !== "tests/foundation/template-smoke.spec.ts"), manifest), /Missing protected files/);
  assert.doesNotThrow(() => assertCandidateLayers(manifest.artifacts.map((entry) => entry.target).filter((file) => file !== "tests/product/README.md"), manifest));
});

test("product extension edits do not change the protected foundation hash", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "candidate-layers-"));
  const productFile = "apps/web/modules/product/product-workspace.tsx";
  const platformFile = "apps/web/modules/platform/auth/actions.ts";
  try {
    await mkdir(path.join(root, path.dirname(productFile)), { recursive: true });
    await mkdir(path.join(root, path.dirname(platformFile)), { recursive: true });
    await writeFile(path.join(root, productFile), "export const product = 'first';\n");
    await writeFile(path.join(root, platformFile), "export const platform = 'stable';\n");
    const protectedFiles = [productFile, platformFile].filter((file) => !isProductEditablePath(file, manifest));
    const before = await hashTree(root, protectedFiles);
    await writeFile(path.join(root, productFile), "export const product = 'second';\n");
    assert.equal(await hashTree(root, protectedFiles), before);
    await writeFile(path.join(root, platformFile), "export const platform = 'changed';\n");
    assert.notEqual(await hashTree(root, protectedFiles), before);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("allow-dirty cannot create a candidate", () => {
  assert.throws(() => assertGenerationMode({ dryRun: false, allowDirty: true }), /only with --dry-run/);
  assert.doesNotThrow(() => assertGenerationMode({ dryRun: true, allowDirty: true }));
});

test("product identity and internal paths are bounded", () => {
  assert.throws(() => validateProductConfig({ ...product, identity: { ...product.identity, id: "Bad ID" } }), /Invalid product config/);
  assert.throws(() => validateProductConfig({ ...product, home: { ...product.home, primaryHref: "//evil.example" } }), /Invalid product config/);
  assert.throws(() => validateProductConfig({ ...product, paths: { ...product.paths, product: "/\\\\evil.example" } }), /Invalid product config/);
  const workspace = { ...product, paths: { ...product.paths, product: "/workspace" }, home: { ...product.home, primaryHref: "/workspace" }, navigation: [{ label: "Overview", href: "/workspace" }, { label: "Activity", href: "/workspace/activity" }] };
  assert.equal(validateProductConfig(workspace), workspace);
  assert.throws(() => validateProductConfig({ ...product, paths: { ...product.paths, product: "/account" } }), /non-reserved/);
  assert.throws(() => validateProductConfig({ ...product, navigation: [{ label: "Missing", href: "/missing" }] }), /configured product workspace/);
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

test("product initialization is repeatable, force-gated and rolls back config plus the product route", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "product-init-"));
  const version = "0.2.0-candidate.8";
  const targets = ["product.config.json", "apps/web/config/product.config.ts", "supabase/config.toml", "product-state.json"];
  try {
    await mkdir(path.join(root, "apps/web/config"), { recursive: true });
    await mkdir(path.join(root, "apps/web/app/(product)/product"), { recursive: true });
    await mkdir(path.join(root, "supabase"), { recursive: true });
    await writeFile(path.join(root, "apps/web/app/(product)/product/page.tsx"), 'import { ProductWorkspace } from "@/modules/product/product-workspace";\nexport default function Page(){ return <ProductWorkspace />; }\n');
    await writeFile(path.join(root, "template-version.json"), JSON.stringify({ candidateVersion: version }));
    await writeFile(path.join(root, "product.config.json"), `${JSON.stringify(product, null, 2)}\n`);
    await writeFile(path.join(root, "apps/web/config/product.config.ts"), generatedProductModule(product, version));
    await writeFile(path.join(root, "supabase/config.toml"), generatedSupabaseConfig(product));
    await writeFile(path.join(root, "product-state.json"), `${JSON.stringify(productState(product, version), null, 2)}\n`);
    await initializeProduct({ root, input: path.join(root, "product.config.json") });
    await initializeProduct({ root, input: path.join(root, "product.config.json") });
    const replacement = {
      ...product,
      identity: { ...product.identity, id: "second-product", name: "Second Product", eventNamespace: "second_product" },
      paths: { ...product.paths, product: "/workspace" },
      home: { ...product.home, primaryHref: "/workspace" },
      navigation: [{ label: "Workspace", href: "/workspace" }, { label: "Activity", href: "/workspace/activity" }],
      localized: {
        "en-US": { ...product.localized["en-US"], navigation: [{ label: "Workspace" }, { label: "Activity" }] },
        "zh-CN": { ...product.localized["zh-CN"], navigation: [{ label: "工作区" }, { label: "动态" }] }
      }
    };
    const replacementFile = path.join(root, "replacement.json");
    await writeFile(replacementFile, JSON.stringify(replacement));
    await assert.rejects(() => initializeProduct({ root, input: replacementFile }), /--force/);
    const before = new Map(await Promise.all(targets.map(async (file) => [file, await readFile(path.join(root, file), "utf8")])));
    await assert.rejects(() => initializeProduct({ root, input: replacementFile, force: true, failAfterRename: 2 }), /Injected/);
    for (const file of targets) assert.equal(await readFile(path.join(root, file), "utf8"), before.get(file));
    assert.equal(await readFile(path.join(root, "apps/web/app/(product)/product/page.tsx"), "utf8"), 'import { ProductWorkspace } from "@/modules/product/product-workspace";\nexport default function Page(){ return <ProductWorkspace />; }\n');
    await initializeProduct({ root, input: replacementFile, force: true });
    assert.equal(JSON.parse(await readFile(path.join(root, "product-state.json"), "utf8")).identity.id, "second-product");
    assert.match(await readFile(path.join(root, "apps/web/app/(product)/workspace/page.tsx"), "utf8"), /ProductWorkspace/);
    await assert.rejects(() => readFile(path.join(root, "apps/web/app/(product)/product/page.tsx"), "utf8"), /ENOENT/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
