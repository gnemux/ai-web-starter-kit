import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const plansDirectory = new URL("./", import.meta.url);

test("save-and-publish delegates to the atomic product-service boundary", async () => {
  const actionsSource = await readFile(new URL("../actions.ts", plansDirectory), "utf8");
  const actionStart = actionsSource.indexOf(
    "export async function saveAndPublishCatCarePlanLocalAction"
  );
  const actionEnd = actionsSource.indexOf(
    "export async function updateCatCarePlanTasksAction",
    actionStart
  );
  const actionSource = actionsSource.slice(actionStart, actionEnd);

  assert.ok(actionStart >= 0 && actionEnd > actionStart);
  assert.match(actionSource, /return saveAndPublishCatCarePlanFromFormData\(formData\)/);
  assert.doesNotMatch(actionSource, /updateCatCarePlanTasksFromFormData/);
  assert.doesNotMatch(actionSource, /publishCatCarePlan\(/);
});

test("draft save and publish share one locked product-service boundary", async () => {
  const actionsSource = await readFile(new URL("../actions.ts", plansDirectory), "utf8");
  const serviceSource = await readFile(
    new URL("../../../lib/catcare/product-service/plans.ts", plansDirectory),
    "utf8"
  );
  const migrationSource = await readFile(
    new URL(
      "../../../../../supabase/migrations/20260717093000_gne_319_atomic_plan_publish.sql",
      plansDirectory
    ),
    "utf8"
  );

  assert.match(serviceSource, /saveCatCarePlanTaskForm\(formData, false\)/);
  assert.match(serviceSource, /saveCatCarePlanTaskForm\(formData, true\)/);
  assert.match(serviceSource, /rpc\("save_care_plan_tasks"/);
  assert.match(serviceSource, /should_publish: shouldPublish/);
  assert.match(migrationSource, /for update;/i);
  assert.match(migrationSource, /should_publish boolean/);
  assert.match(migrationSource, /care_plan_requires_enabled_task/);
  assert.match(migrationSource, /when should_publish then 'published'/);
  assert.match(migrationSource, /care_tasks\.enabled/);
  assert.doesNotMatch(actionsSource, /publishCatCarePlan(Action|LocalAction)/);
  assert.doesNotMatch(actionsSource, /publishCatCarePlan\(/);
});

test("both top and editor publish controls submit the live task editor form", async () => {
  const detailSource = await readFile(
    new URL("./plan-detail-client.tsx", plansDirectory),
    "utf8"
  );
  const formSource = await readFile(
    new URL("./plan-task-save-form-client.tsx", plansDirectory),
    "utf8"
  );

  assert.match(detailSource, /form=\{taskFormId\}/);
  assert.match(detailSource, /publishAction=\{saveAndPublishCatCarePlanLocalAction\}/);
  assert.match(formSource, /id=\{formId\}/);
  assert.match(formSource, /formData\.get\("intent"\) === "publish"/);
  assert.match(formSource, /await publishAction\(formData\)/);
  assert.match(detailSource, /disabled=\{pendingAction !== null\}/);
  assert.match(formSource, /blocked \|\| pendingIntent/);
});

test("draft-only save remains available without being required before publish", async () => {
  const formSource = await readFile(
    new URL("./plan-task-save-form-client.tsx", plansDirectory),
    "utf8"
  );

  assert.match(formSource, /value="save"/);
  assert.match(formSource, /仅保存草稿/);
  assert.match(formSource, /value="publish"/);
  assert.match(formSource, /保存并发布/);
});
