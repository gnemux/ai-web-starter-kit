import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const plansDirectory = new URL("./", import.meta.url);

test("plan detail parallelizes independent secondary reads", async () => {
  const pageSource = await readFile(new URL("./[id]/page.tsx", plansDirectory), "utf8");

  assert.match(pageSource, /Promise\.all\(\[/);
  assert.match(pageSource, /getCarePlanShareLinkState\(result\.data\.id\)/);
  assert.match(pageSource, /getCatCareAuditActivities\(result\.data\.ownerId, result\.data\.id\)/);
});

test("share actions return their state without revalidating the full detail route", async () => {
  const actionsSource = await readFile(new URL("../actions.ts", plansDirectory), "utf8");
  const createStart = actionsSource.indexOf(
    "export async function createCarePlanShareLinkLocalAction"
  );
  const recapStart = actionsSource.indexOf(
    "export async function runCatCarePlanAiRecapAction"
  );
  const shareActionsSource = actionsSource.slice(createStart, recapStart);

  assert.ok(createStart >= 0 && recapStart > createStart);
  assert.doesNotMatch(shareActionsSource, /revalidatePath/);
  assert.match(shareActionsSource, /return createCarePlanShareLink\(planId\)/);
  assert.match(shareActionsSource, /return revokeCarePlanShareLink\(planId\)/);
});

test("share controls expose an immediate disabled progress state", async () => {
  const clientSource = await readFile(
    new URL("./plan-detail-client.tsx", plansDirectory),
    "utf8"
  );
  const securitySource = await readFile(
    new URL("./plan-detail-security.tsx", plansDirectory),
    "utf8"
  );

  assert.match(clientSource, /disabled=\{pendingAction !== null\}/);
  assert.match(securitySource, /正在生成链接…/);
  assert.match(securitySource, /正在重新生成…/);
  assert.match(securitySource, /正在撤销…/);
  assert.match(clientSource, /AuditActivityList activities=\{currentAuditActivities\}/);
  assert.match(securitySource, /私密链接已重新生成/);
});
