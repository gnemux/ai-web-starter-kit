import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const core = read("./core.ts");
const plans = read("./plans.ts");
const shares = read("./share-tokens.ts");
const view = read("./anonymous-view.ts");
const submissions = read("./anonymous-submissions.ts");
const ai = read("../../services/ai.ts");
const actions = read("../../../app/catcare/actions.ts");

function section(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);

  assert.notEqual(from, -1, `missing section start: ${start}`);
  assert.notEqual(to, -1, `missing section end: ${end}`);
  return source.slice(from, to);
}

test("product and AI analytics forward the action safe metadata", () => {
  const productTracker = section(
    core,
    "export async function trackCatCareProductEvent",
    "export function mapPlan"
  );
  const aiAction = section(
    ai,
    "export async function generateAiText(",
    "function buildAiResponse("
  );
  const aiCalls = [...aiAction.matchAll(/trackAiEvent\(\{([\s\S]*?)\n\s*\}\)/g)];

  assert.match(productTracker, /metadata\?: SafeCapabilityContext/);
  assert.match(productTracker, /trackCatCareAnalyticsEvent\(\{[\s\S]*metadata,/);
  assert.ok(aiCalls.length >= 8);
  assert.ok(
    aiCalls.every((call) => call[1].includes("metadata: safeMetadata")),
    "every AI analytics outcome must reuse the validated action metadata"
  );
});

test("publish owns one correlation id for Audit and PostHog", () => {
  const publish = section(
    plans,
    "async function saveCatCarePlanTaskForm",
    "function normalizeAtomicPlanInput"
  );

  assert.equal((publish.match(/randomUUID\(\)/g) ?? []).length, 1);
  assert.match(
    publish,
    /trackCatCareProductEvent\([\s\S]*correlation_id: correlationId[\s\S]*recordCatCareAuditEvent\([\s\S]*correlationId,/
  );
});

test("share lifecycle owns one correlation id per create or revoke action", () => {
  const create = section(
    shares,
    "export async function createCarePlanShareLink",
    "export async function revokeCarePlanShareLink"
  );
  const revoke = section(
    shares,
    "export async function revokeCarePlanShareLink",
    "export async function resolveCarePlanShareToken"
  );

  assert.equal((create.match(/randomUUID\(\)/g) ?? []).length, 1);
  assert.match(create, /eventName: "share_link_revoked"[\s\S]*correlationId,/);
  assert.match(create, /eventName: "share_link_created"[\s\S]*correlationId,/);
  assert.match(create, /catcare_share_link_created[\s\S]*correlation_id: correlationId/);
  assert.equal((revoke.match(/randomUUID\(\)/g) ?? []).length, 1);
  assert.match(revoke, /eventName: "share_link_revoked"[\s\S]*correlationId,/);
  assert.match(revoke, /catcare_share_link_revoked[\s\S]*correlation_id: correlationId/);
  const activeRowBranchStart = revoke.indexOf("if (revokeResult.data) {");
  const activeRowBranchEnd = revoke.indexOf("\n  }\n", activeRowBranchStart);
  const revokeAnalytics = revoke.indexOf("catcare_share_link_revoked");
  assert.ok(
    revokeAnalytics > activeRowBranchStart && revokeAnalytics < activeRowBranchEnd,
    "revoke analytics must stay inside the active-row branch"
  );
});

test("anonymous view and submit reuse one correlation id across capabilities", () => {
  const viewAction = section(
    view,
    "export async function getAnonymousCarePlanView",
    "function createAnonymousSubmissionSlotKey"
  );
  const submitAction = section(
    submissions,
    "export async function submitAnonymousCareSubmissionFromFormData",
    "function recordSubmissionOutbox"
  );

  assert.equal((viewAction.match(/randomUUID\(\)/g) ?? []).length, 1);
  assert.match(
    viewAction,
    /resolveCarePlanShareToken\(\s*secret,\s*new Date\(\),\s*correlationId\s*\)/
  );
  assert.match(viewAction, /eventName: "share_page_viewed"[\s\S]*correlationId,/);
  assert.match(viewAction, /catcare_share_page_viewed[\s\S]*correlation_id: correlationId/);

  assert.equal((submitAction.match(/randomUUID\(\)/g) ?? []).length, 1);
  assert.match(
    submitAction,
    /resolveCarePlanShareToken\(\s*secret,\s*new Date\(\),\s*correlationId\s*\)/
  );
  assert.match(submitAction, /recordSubmissionOutbox\(\{[\s\S]*correlationId,/);
  assert.match(submitAction, /catcare_submission_created[\s\S]*correlation_id: correlationId/);
});

test("all token rejection outcomes share Audit and safe PostHog correlation", () => {
  const rejection = section(
    shares,
    "function rejectShareTokenOutcome",
    "async function getOwnerPlanShareContext"
  );

  assert.match(rejection, /correlationId: string/);
  assert.match(rejection, /recordCatCareAuditEvent\(\{[\s\S]*correlationId,/);
  assert.match(rejection, /catcare_share_link_rejected/);
  assert.match(rejection, /outcome: status/);
  assert.match(rejection, /correlation_id: correlationId/);
  assert.doesNotMatch(rejection, /actor\?\.tokenId \?\?/);
  assert.match(rejection, /trackCatCareProductEvent\(\s*"anonymous_token"/);
});

test("anonymous analytics never use token record ids as distinct ids", () => {
  assert.doesNotMatch(view, /trackCatCareProductEvent\(\s*tokenResult\.data\.tokenId/);
  assert.doesNotMatch(
    submissions,
    /trackCatCareProductEvent\(\s*tokenResult\.data\.tokenId/
  );
});

test("each AI recap invocation creates a fresh correlation id", () => {
  const recap = section(
    actions,
    "export async function runCatCarePlanAiRecapAction",
    "function formatPlanStatusLabel"
  );

  assert.match(recap, /const correlationId = randomUUID\(\)/);
  assert.doesNotMatch(recap, /catcare_result_recap:\$\{/);
  assert.match(recap, /correlation_id: correlationId/);
});
