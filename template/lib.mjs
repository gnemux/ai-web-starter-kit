import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, readdir, realpath, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import Ajv2020 from "ajv/dist/2020.js";
import { generatedProductModule, generatedSupabaseConfig, productState, validateProductConfig as validatePortableProductConfig } from "./blueprint/scripts/product-config.mjs";

const textDecoder = new TextDecoder("utf-8", { fatal: true });
const buildArtifactNames = new Set(["node_modules", ".next", ".turbo", ".vercel", ".temp", ".branches", "coverage", "dist"]);

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

export async function listFiles(root, relative = "", options = {}) {
  const directory = path.join(root, relative);
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (options.ignoreBuildArtifacts && (buildArtifactNames.has(entry.name) || entry.name.endsWith(".tsbuildinfo"))) continue;
    const next = path.posix.join(relative.split(path.sep).join(path.posix.sep), entry.name);
    const absolute = path.join(root, next);
    if (entry.isSymbolicLink()) throw new Error(`Symbolic links are not allowed: ${next}`);
    if (entry.isDirectory()) files.push(...await listFiles(root, next, options));
    else if (entry.isFile()) files.push(next);
    else throw new Error(`Unsupported filesystem entry: ${next}`);
  }
  return files;
}

export function validateManifest(manifest, schema) {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);
  if (!validate(manifest)) {
    throw new Error(`Invalid template manifest: ${ajv.errorsText(validate.errors, { separator: "; " })}`);
  }
  return manifest;
}

const configSchema = {
  type: "object",
  additionalProperties: false,
  required: ["identity", "paths", "home", "login", "account", "capabilities", "navigation", "footerLinks", "theme"],
  properties: {
    identity: {
      type: "object", additionalProperties: false,
      required: ["id", "name", "mark", "tagline", "locale", "eventNamespace"],
      properties: {
        id: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$", maxLength: 48 },
        name: { type: "string", minLength: 1, maxLength: 64 },
        mark: { type: "string", minLength: 1, maxLength: 4 },
        tagline: { type: "string", minLength: 1, maxLength: 160 },
        locale: { type: "string", pattern: "^[a-z]{2}(?:-[A-Z]{2})?$" },
        eventNamespace: { type: "string", pattern: "^[a-z][a-z0-9_]*$", maxLength: 48 }
      }
    },
    paths: {
      type: "object", additionalProperties: false,
      required: ["home", "login", "account", "product", "billing", "usage"],
      properties: Object.fromEntries(["home", "login", "account", "product", "billing", "usage"].map((key) => [key, { type: "string", pattern: "^/(?!/)[^\\s\\\\]*$" }]))
    },
    home: {
      type: "object", additionalProperties: false,
      required: ["eyebrow", "title", "description", "primaryAction", "primaryHref", "secondaryAction", "secondaryHref"],
      properties: Object.fromEntries(["eyebrow", "title", "description", "primaryAction", "secondaryAction"].map((key) => [key, { type: "string", minLength: 1, maxLength: 220 }]).concat([["primaryHref", { type: "string", pattern: "^/(?!/)[^\\s\\\\]*$" }], ["secondaryHref", { type: "string", pattern: "^/(?!/)[^\\s\\\\]*$" }]]))
    },
    login: { $ref: "#/$defs/textBlock" },
    account: { $ref: "#/$defs/textBlock" },
    capabilities: {
      type: "object", additionalProperties: false, required: ["analytics", "payment", "ai"],
      properties: {
        analytics: { enum: ["disabled", "enabled"] },
        payment: { enum: ["disabled", "sandbox"] },
        ai: { enum: ["disabled", "sandbox"] }
      }
    },
    navigation: { $ref: "#/$defs/linkList" },
    footerLinks: { $ref: "#/$defs/linkList" },
    theme: {
      type: "object", additionalProperties: false, required: ["accent", "accentSoft", "surface", "ink"],
      properties: Object.fromEntries(["accent", "accentSoft", "surface", "ink"].map((key) => [key, { type: "string", pattern: "^#[0-9a-fA-F]{6}$" }]))
    }
  },
  $defs: {
    textBlock: {
      type: "object", additionalProperties: false, required: ["title", "description"],
      properties: { title: { type: "string", minLength: 1, maxLength: 120 }, description: { type: "string", minLength: 1, maxLength: 220 } }
    },
    linkList: {
      type: "array", maxItems: 8,
      items: { type: "object", additionalProperties: false, required: ["label", "href"], properties: { label: { type: "string", minLength: 1, maxLength: 48 }, href: { type: "string", pattern: "^/(?!/)[^\\s\\\\]*$" } } }
    }
  }
};

export function validateProductConfig(config) {
  try { return validatePortableProductConfig(config); }
  catch (error) { throw new Error(`Invalid product config: ${error instanceof Error ? error.message : error}`); }
}

export function assertInventory(actualFiles, declaredFiles) {
  const actual = [...actualFiles].sort();
  const declared = [...declaredFiles].sort();
  if (actual.length !== declared.length || actual.some((file, index) => file !== declared[index])) {
    const unknown = actual.filter((file) => !declared.includes(file));
    const missing = declared.filter((file) => !actual.includes(file));
    throw new Error(`Blueprint inventory mismatch. Unknown: ${unknown.join(", ") || "none"}; missing: ${missing.join(", ") || "none"}`);
  }
}

export function assertArtifactInventory(actualFiles, artifacts) {
  const targets = artifacts.map((entry) => entry.target);
  if (new Set(targets).size !== targets.length) throw new Error("Artifact targets must be unique");
  const copies = artifacts.filter((entry) => entry.action === "copy");
  for (const entry of copies) {
    const expectedSource = `template/blueprint/${entry.target}`;
    if (entry.source !== expectedSource || entry.classification !== "keep") throw new Error(`Copy artifact must be byte-preserving: ${entry.target}`);
  }
  const declaredFiles = copies.map((entry) => entry.source.slice("template/blueprint/".length));
  assertInventory(actualFiles, declaredFiles);
  for (const target of ["apps/web/config/product.config.ts", "supabase/config.toml", "product.config.json", "product-state.json", "template-manifest.json", "template-product.json", "template-version.json"]) {
    const entry = artifacts.find((artifact) => artifact.target === target);
    if (!entry || entry.action !== "generate" || entry.classification !== "transform") throw new Error(`Named generated artifact missing: ${target}`);
  }
  return copies;
}

export function assertGenerationMode({ dryRun, allowDirty }) {
  if (allowDirty && !dryRun) throw new Error("--allow-dirty is permitted only with --dry-run");
}

export function gitMetadata(root) {
  const run = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  return {
    repository: run("config", "--get", "remote.origin.url"),
    commit: run("rev-parse", "HEAD"),
    committedAt: run("show", "-s", "--format=%cI", "HEAD"),
    dirty: run("status", "--porcelain").length > 0
  };
}

async function assertNoSymlinkComponents(target) {
  const absolute = path.resolve(target);
  const parsed = path.parse(absolute);
  let cursor = parsed.root;
  for (const part of absolute.slice(parsed.root.length).split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor, part);
    try {
      if ((await lstat(cursor)).isSymbolicLink()) throw new Error(`Output path contains a symbolic link: ${cursor}`);
    } catch (error) {
      if (error?.code === "ENOENT") return;
      throw error;
    }
  }
}

export async function assertSafeOutput(sourceRoot, outputRoot) {
  const source = await realpath(sourceRoot);
  const output = path.resolve(outputRoot);
  if (output === source || output.startsWith(`${source}${path.sep}`) || source.startsWith(`${output}${path.sep}`)) {
    throw new Error("Candidate output must be outside the research repository");
  }
  await assertNoSymlinkComponents(output);
  try {
    const info = await stat(output);
    if (!info.isDirectory()) throw new Error("Candidate output already exists and is not a directory");
    if ((await readdir(output)).length > 0) throw new Error("Candidate output must not already contain files");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

export async function hashTree(root, files = undefined) {
  const inventory = files ?? await listFiles(root);
  const hash = createHash("sha256");
  for (const file of [...inventory].sort()) {
    hash.update(file).update("\0").update(await readFile(path.join(root, file))).update("\0");
  }
  return hash.digest("hex");
}

export async function hashTreeWithOverrides(root, files, overrides = new Map()) {
  const hash = createHash("sha256");
  for (const file of [...files].sort()) {
    hash.update(file).update("\0").update(overrides.has(file) ? overrides.get(file) : await readFile(path.join(root, file))).update("\0");
  }
  return hash.digest("hex");
}

async function copyBlueprint(blueprintRoot, outputRoot, artifacts) {
  for (const artifact of artifacts) {
    const file = artifact.source.slice("template/blueprint/".length);
    const source = path.join(blueprintRoot, file);
    const target = path.join(outputRoot, artifact.target);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, await readFile(source), { flag: "wx" });
  }
}

function secretLike(text) {
  const assignments = text.matchAll(/\b(?:SECRET|TOKEN|PASSWORD|PRIVATE_KEY|SERVICE_ROLE_KEY)\b[ \t]*[:=][ \t]*["']?([^\s"']+)/g);
  for (const match of assignments) {
    const value = match[1];
    if (!/^(?:$|disabled|placeholder|replace_me|your_|<)/i.test(value)) return true;
  }
  return /(?:sk_live_|gh[opsu]_[A-Za-z0-9]{20,}|sb_secret_[A-Za-z0-9_-]{20,})/.test(text);
}

export async function scanCandidate(root, options = {}) {
  const files = await listFiles(root, "", options);
  const joinedSignatures = (groups) => groups.map((parts) => parts.join(""));
  const productSignatures = joinedSignatures([
    ["cat", "care"], ["reference-", "product"], ["demo_", "items"], ["demo-", "items"], ["cat-", "photos"],
  ]);
  const environmentSignatures = joinedSignatures([
    ["ngli", "lxhkuqzswbwitbdu"],
    ["ai-web-starter-kit-web", ".vercel.app"],
    ["posthog.com/project/", "476", "986"],
  ]);
  const absolutePathSignatures = joinedSignatures([
    ["/", "Users", "/"], ["/private/", "tmp", "/"], [":\\", "Users", "\\"],
  ]);
  for (const file of files) {
    if (/(?:^|\/)(?:\.git|node_modules|\.next|\.turbo|\.vercel|coverage|dist)(?:\/|$)/.test(file)) throw new Error(`Private or build residue detected: ${file}`);
    if (/(?:^|\/)\.env(?:\..+)?$/.test(file) && !file.endsWith(".env.example")) throw new Error(`Private environment file is forbidden: ${file}`);
    if (productSignatures.some((value) => file.toLowerCase().includes(value))) throw new Error(`Product path pollution detected: ${file}`);
    if (file === ".env.local" || file.endsWith("/.env.local")) throw new Error(`Private environment file is forbidden: ${file}`);
    const bytes = await readFile(path.join(root, file));
    let text;
    try { text = textDecoder.decode(bytes); } catch { throw new Error(`Unclassified binary is forbidden: ${file}`); }
    if (secretLike(text)) throw new Error(`Secret-shaped value detected: ${file}`);
    if (absolutePathSignatures.some((value) => text.includes(value))) throw new Error(`Source absolute path detected: ${file}`);
    if (/\bGNE-\d+\b|\bPR\s*#\d+\b/i.test(text) || environmentSignatures.some((value) => text.toLowerCase().includes(value))) throw new Error(`Environment or execution-history identifier detected: ${file}`);
    if (productSignatures.some((value) => text.toLowerCase().includes(value))) throw new Error(`Product pollution detected: ${file}`);
  }
  return files;
}

export async function generateCandidate({ sourceRoot, outputRoot, configFile, dryRun = false, allowDirty = false }) {
  assertGenerationMode({ dryRun, allowDirty });
  const templateRoot = path.join(sourceRoot, "template");
  const blueprintRoot = path.join(templateRoot, "blueprint");
  const manifest = validateManifest(await readJson(path.join(templateRoot, "manifest.json")), await readJson(path.join(templateRoot, "manifest.schema.json")));
  const config = validateProductConfig(await readJson(configFile ?? path.join(templateRoot, "default-product.json")));
  const actualFiles = await listFiles(blueprintRoot);
  const copyArtifacts = assertArtifactInventory(actualFiles, manifest.artifacts);
  const source = gitMetadata(sourceRoot);
  if (source.dirty && !allowDirty) throw new Error("Research repository must be clean before candidate generation");
  await assertSafeOutput(sourceRoot, outputRoot);
  const blueprintHash = await hashTree(blueprintRoot, actualFiles);
  const manifestHash = sha256(JSON.stringify(manifest));
  const configHash = sha256(JSON.stringify(config));
  const sourceMapHash = sha256(JSON.stringify(await readJson(path.join(templateRoot, "source-map.json"))));
  if (dryRun) return { blueprintHash, manifestHash, configHash, sourceMapHash, source };

  const temporary = `${path.resolve(outputRoot)}.partial-${process.pid}`;
  await rm(temporary, { recursive: true, force: true });
  await mkdir(temporary, { recursive: true });
  try {
    await copyBlueprint(blueprintRoot, temporary, copyArtifacts);
    await writeFile(path.join(temporary, "apps/web/config/product.config.ts"), generatedProductModule(config, manifest.candidateVersion));
    await writeFile(path.join(temporary, "supabase/config.toml"), generatedSupabaseConfig(config));
    await writeFile(path.join(temporary, "product.config.json"), `${JSON.stringify(config, null, 2)}\n`);
    await writeFile(path.join(temporary, "product-state.json"), `${JSON.stringify(productState(config, manifest.candidateVersion), null, 2)}\n`);
    await writeFile(path.join(temporary, "template-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
    await writeFile(path.join(temporary, "template-product.json"), `${JSON.stringify(config, null, 2)}\n`);
    const candidateLockHash = sha256(await readFile(path.join(temporary, "pnpm-lock.yaml")));
    const noticesHash = sha256(await readFile(path.join(temporary, "THIRD_PARTY_NOTICES.md")));
    const contentHash = await hashTree(temporary);
    const version = {
      schemaVersion: 1,
      candidateVersion: manifest.candidateVersion,
      source: { repository: source.repository, commit: source.commit, committedAt: source.committedAt, packageVersion: manifest.sourcePackageVersion },
      generator: { version: manifest.generatorVersion, manifestVersion: manifest.manifestVersion, schemaVersion: manifest.schemaVersion },
      sourceProjection: { file: "template/source-map.json", hash: sourceMapHash },
      foundation: { migrationFile: manifest.foundation.migrationFile, schemaVersion: manifest.foundation.schemaVersion },
      notices: { file: "THIRD_PARTY_NOTICES.md", inventoryVersion: manifest.noticesInventoryVersion, hash: noticesHash },
      product: { id: config.identity.id, locale: config.identity.locale, eventNamespace: config.identity.eventNamespace },
      providerModes: config.capabilities,
      hashes: { manifest: manifestHash, blueprint: blueprintHash, config: configHash, candidateLock: candidateLockHash, normalizedContent: contentHash },
      toolchain: manifest.toolchain,
      packageSnapshots: manifest.packageSnapshots
    };
    await writeFile(path.join(temporary, "template-version.json"), `${JSON.stringify(version, null, 2)}\n`);
    await scanCandidate(temporary);
    await rename(temporary, path.resolve(outputRoot));
    return version;
  } catch (error) {
    await rm(temporary, { recursive: true, force: true });
    throw error;
  }
}
