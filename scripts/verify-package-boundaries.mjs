import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const failures = [];

const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);
const ignoredSegments = new Set([
  ".git",
  ".next",
  ".turbo",
  "coverage",
  "dist",
  "node_modules"
]);

const productDomainPatterns = [
  /\bcats\b/i,
  /\bcare_plans\b/i,
  /\bcare_tasks\b/i,
  /\bcare_submissions\b/i
];

const coreForbiddenPatterns = [
  /from\s+["']next(?:\/[^"']*)?["']/,
  /from\s+["']@vercel\/[^"']+["']/,
  /from\s+["']hono(?:\/[^"']*)?["']/,
  /from\s+["'](?:@cloudflare\/[^"']+|cloudflare:[^"']+)["']/,
  /from\s+["']@supabase\/(?:supabase-js|ssr|auth-helpers[^"']*)["']/,
  /\bNextRequest\b/,
  /\bNextResponse\b/,
  /\bExecutionContext\b/,
  /\bCloudflare\b/
];

const commonRuntimeForbiddenPatterns = [
  /from\s+["']next\/(?:server|headers|cookies|navigation)["']/,
  /from\s+["']@vercel\/[^"']+["']/,
  /from\s+["']hono(?:\/[^"']*)?["']/,
  /from\s+["'](?:@cloudflare\/[^"']+|cloudflare:[^"']+)["']/,
  /from\s+["']@supabase\/ssr["']/,
  /\bNextRequest\b/,
  /\bNextResponse\b/,
  /\bHono\b/,
  /\bExecutionContext\b/,
  /\bRequestContext\b/,
  /\bCloudflare\b/
];

const internalPackageImportPatterns = [
  /from\s+["']@xwlc\/[^"']+\/(?:src|internal)(?:\/[^"']*)?["']/,
  /import\s*\(\s*["']@xwlc\/[^"']+\/(?:src|internal)(?:\/[^"']*)?["']\s*\)/,
  /require\s*\(\s*["']@xwlc\/[^"']+\/(?:src|internal)(?:\/[^"']*)?["']\s*\)/
];

const clientSecretPatterns = [
  /\bSUPABASE_SECRET_KEY\b/,
  /\bSUPABASE_SERVICE_ROLE_KEY\b/,
  /\bSERVICE_ROLE\b/,
  /from\s+["']server-only["']/
];

const sensitiveTelemetryPatterns = [
  /\braw_token\b/i,
  /\brawToken\b/,
  /\braw_prompt\b/i,
  /\brawPrompt\b/,
  /\bprivate_submission_text\b/i,
  /\bprivateSubmissionText\b/
];

function listFiles(dir) {
  const absoluteDir = join(root, dir);
  const entries = readdirSync(absoluteDir);
  const files = [];

  for (const entry of entries) {
    if (ignoredSegments.has(entry)) {
      continue;
    }

    const absolutePath = join(absoluteDir, entry);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      files.push(...listFiles(relative(root, absolutePath)));
      continue;
    }

    if (isSourceFile(entry)) {
      files.push(relative(root, absolutePath));
    }
  }

  return files;
}

function isSourceFile(path) {
  return [...sourceExtensions].some((extension) => path.endsWith(extension));
}

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function expectNoMatch(files, patterns, message) {
  for (const file of files) {
    const source = read(file);

    for (const pattern of patterns) {
      if (pattern.test(source)) {
        failures.push(`${message}: ${file} matched ${pattern}`);
      }
    }
  }
}

function isClientComponent(source) {
  return /^\s*["']use client["'];?/m.test(source);
}

const packageFiles = listFiles("packages");
const coreFiles = listFiles("packages/core/src");
const platformFiles = listFiles("packages/platform/src");
const dbFiles = listFiles("packages/db/src");
const appFiles = listFiles("apps/web");
const clientFiles = appFiles.filter((file) => isClientComponent(read(file)));
const telemetryFiles = appFiles.filter((file) => {
  const source = read(file);
  return (
    source.includes("posthog") ||
    source.includes("PostHog") ||
    source.includes("track") ||
    source.includes("capture") ||
    source.includes("analytics")
  );
});

expectNoMatch(
  coreFiles,
  coreForbiddenPatterns,
  "@xwlc/core must stay provider/runtime agnostic"
);

expectNoMatch(
  [...platformFiles, ...dbFiles],
  commonRuntimeForbiddenPatterns,
  "@xwlc/platform and @xwlc/db must not bind to app runtime request/response APIs"
);

expectNoMatch(
  packageFiles,
  productDomainPatterns,
  "Reusable packages must not contain Reference Product business table names"
);

expectNoMatch(
  appFiles,
  internalPackageImportPatterns,
  "apps/web must consume @xwlc package public entries only"
);

expectNoMatch(
  clientFiles,
  clientSecretPatterns,
  "Client components must not import server-only modules or service-role secrets"
);

expectNoMatch(
  telemetryFiles,
  sensitiveTelemetryPatterns,
  "Telemetry must not expose raw tokens, raw prompts, or private submission text"
);

if (failures.length > 0) {
  console.error("Package boundary verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Package boundary verification passed.");
