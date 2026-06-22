import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const failures = [];

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function expect(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function section(source, start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex);

  if (startIndex === -1 || endIndex === -1) {
    return "";
  }

  return source.slice(startIndex, endIndex);
}

function walk(dir) {
  const output = [];
  const absoluteDir = join(root, dir);

  for (const entry of readdirSync(absoluteDir)) {
    if (
      entry === "node_modules" ||
      entry === ".next" ||
      entry === ".turbo" ||
      entry === "dist" ||
      entry === "out"
    ) {
      continue;
    }

    const absolutePath = join(absoluteDir, entry);
    const stat = statSync(absolutePath);

    if (stat.isDirectory()) {
      output.push(...walk(relative(root, absolutePath)));
      continue;
    }

    if (/\.(mjs|js|ts|tsx)$/.test(entry)) {
      output.push(relative(root, absolutePath));
    }
  }

  return output;
}

const envExample = read(".env.example");
const aiService = read("apps/web/lib/services/ai.ts");
const billingService = read("apps/web/lib/services/billing.ts");
const aiModels = read("apps/web/lib/providers/ai-models.ts");
const billingMigration = read(
  "supabase/migrations/20260621130735_create_billing_foundation.sql"
);
const sourceFiles = [...walk("apps/web"), ...walk("packages/core")];
const sourceText = sourceFiles.map((path) => read(path)).join("\n");

expect(
  !/NEXT_PUBLIC_[A-Z0-9_]*AI[A-Z0-9_]*(KEY|SECRET|TOKEN)/i.test(sourceText),
  "AI key-like NEXT_PUBLIC variables must not appear in source files."
);
expect(
  !envExample
    .split(/\r?\n/)
    .some((line) => {
      const match = line.match(/^AI_PROVIDER_API_KEY=(.*)$/);
      return match ? match[1].trim().length > 0 : false;
  }),
  ".env.example must keep AI_PROVIDER_API_KEY empty."
);
expect(
  !envExample
    .split(/\r?\n/)
    .some((line) => {
      const match = line.match(/^AI_BUDGET_LIMIT=(.*)$/);
      return match ? match[1].trim().length > 0 : false;
    }),
  ".env.example must keep AI_BUDGET_LIMIT empty."
);
expect(
  !/sk-[A-Za-z0-9]{10,}/.test(`${envExample}\n${sourceText}`),
  "No OpenAI-style secret values may be committed."
);
expect(
  aiService.includes('import "server-only";'),
  "AI service must remain server-only."
);
expect(
  !aiModels.includes("AI_PROVIDER_API_KEY"),
  "Model catalog must not read provider secrets."
);
expect(
  !/NEXT_PUBLIC_[A-Z0-9_]*AI[A-Z0-9_]*BUDGET/i.test(sourceText),
  "AI budget controls must not be exposed through NEXT_PUBLIC variables."
);
expect(
  sourceText.includes("normalizeAiBudgetLimitCredits") &&
    sourceText.includes("assertAiBudgetLimit"),
  "AI budget limit parsing and assertion must stay in shared AI logic."
);
expect(
  aiService.includes("process.env.AI_BUDGET_LIMIT") &&
    aiService.includes("reason: budgetGate.reason") &&
    aiService.indexOf("reason: budgetGate.reason") <
      aiService.indexOf(
        "const providerFactoryResult = createConfiguredAiProvider"
      ),
  "AI service must enforce AI_BUDGET_LIMIT before provider creation."
);

const usageMetadata = section(
  aiService,
  "const usageMetadata = {",
  "const usageCommitResult"
);
expect(
  usageMetadata.length > 0,
  "AI service must build explicit usage metadata before ledger writes."
);
expect(
  !/\b(raw_prompt|prompt|generated_text|provider_payload|api_key|secret)\b/i.test(
    usageMetadata
  ),
  "AI usage ledger metadata must not include raw prompt, generated text, provider payloads, or secrets."
);

const commitAiCreditUsage = section(
  billingService,
  "export async function commitAiCreditUsage",
  "export async function findCommittedAiCreditUsage"
);
expect(
  commitAiCreditUsage.includes(".insert(") &&
    !commitAiCreditUsage.includes(".upsert("),
  "AI Credit usage commits must insert first so duplicate events are observable."
);
expect(
  commitAiCreditUsage.includes("isUniqueViolation") &&
    billingService.includes("deduplicated: true") &&
    billingService.includes("consumedCredits: 0"),
  "Duplicate AI Credit usage must return a deduplicated 0-Credit outcome."
);
expect(
  aiService.includes("findCommittedAiCreditUsage") &&
    aiService.includes('reason: "duplicate"'),
  "AI service must detect committed duplicate requests before provider calls and during commit races."
);
expect(
  aiService.includes('event: "ai_request_started"') &&
    aiService.includes('event: "ai_request_completed"') &&
    aiService.includes('event: "ai_request_failed"') &&
    aiService.includes('? "quota_limit_reached"'),
  "AI service must emit safe server-side started, completed, failed, and quota events."
);
expect(
  /create table public\.billing_credit_ledger[\s\S]*idempotency_key text not null unique/.test(
    billingMigration
  ),
  "billing_credit_ledger must keep a unique idempotency key."
);
expect(
  /create table public\.billing_usage_ledger[\s\S]*idempotency_key text not null unique/.test(
    billingMigration
  ),
  "billing_usage_ledger must keep a unique idempotency key."
);
expect(
  !/from\s+["'](openai|@anthropic-ai|@google\/generative-ai)["']/.test(
    sourceText
  ),
  "MVP2 AI source must not import real provider SDKs."
);

if (failures.length > 0) {
  console.error("AI safety verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("AI safety verification passed.");
