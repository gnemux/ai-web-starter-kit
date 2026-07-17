import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const catcareDirectory = new URL("./", import.meta.url);

test("CatCare shell consumes real notification state instead of a fixed badge", async () => {
  const [shellSource, centerSource] = await Promise.all([
    readFile(new URL("./catcare-shell-client.tsx", catcareDirectory), "utf8"),
    readFile(new URL("./notification-center-client.tsx", catcareDirectory), "utf8")
  ]);

  assert.match(shellSource, /CatCareNotificationCenter/);
  assert.doesNotMatch(shellSource, />\s*3\s*</);
  assert.match(centerSource, /unreadCount > 0/);
  assert.match(centerSource, /markAllOwnerNotificationsReadAction/);
});

test("notification center has accessible disclosure, empty, error and stale-target states", async () => {
  const source = await readFile(
    new URL("./notification-center-client.tsx", catcareDirectory),
    "utf8"
  );

  assert.match(source, /aria-expanded=\{isOpen\}/);
  assert.match(source, /role="dialog"/);
  assert.match(source, /panelRef\.current\?\.focus\(\)/);
  assert.match(source, /triggerRef\.current\?\.focus\(\)/);
  assert.match(source, /tabIndex=\{-1\}/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /labels\.emptyTitle/);
  assert.match(source, /labels\.loadError/);
  assert.match(source, /labels\.targetUnavailable/);
  assert.match(source, /fixed inset-x-4/);
  assert.match(source, /sm:absolute sm:inset-x-auto sm:right-0/);
});

test("notification list uses delivery time instead of read-state update time", async () => {
  const serviceSource = await readFile(
    new URL("../../lib/catcare/product-service/notifications.ts", catcareDirectory),
    "utf8"
  );

  assert.match(serviceSource, /\.order\("last_notified_at"/);
  assert.doesNotMatch(serviceSource, /\.order\("updated_at"/);
});

test("care exceptions remain visually distinct from ordinary submissions", async () => {
  const source = await readFile(
    new URL("./notification-center-client.tsx", catcareDirectory),
    "utf8"
  );

  assert.match(source, /notification\.eventType === "care_exception"/);
  assert.match(source, /border-l-amber-500/);
  assert.match(source, /bg-amber-100\/60/);
  assert.match(source, /ring-amber-100/);
  assert.match(source, /isUnread[\s\S]*bg-slate-300/);
  assert.match(source, /labels\.exceptionBadge/);
  assert.equal(source.match(/hover:bg-teal-50\/70/g)?.length, 2);
  assert.equal(source.match(/hover:bg-amber-100\/70/g)?.length, 1);
});

test("a sitter can revise meaningful feedback while photo-only follow-up stays separate", async () => {
  const [source, actionSource] = await Promise.all([
    readFile(
      new URL("../s/[token]/visit-accordion-client.tsx", catcareDirectory),
      "utf8"
    ),
    readFile(new URL("../s/[token]/actions.ts", catcareDirectory), "utf8")
  ]);
  const photoOnlyFlow = source.slice(
    source.indexOf("async function onEvidenceRetry"),
    source.indexOf("async function onSubmit")
  );
  const submitFlow = source.slice(
    source.indexOf("async function onSubmit"),
    source.indexOf("return (", source.indexOf("async function onSubmit"))
  );

  assert.match(source, /const \[isEditing, setIsEditing\] = useState\(false\)/);
  assert.match(source, /修改状态或备注/);
  assert.match(source, /保存最新反馈/);
  assert.match(source, /取消修改/);
  assert.match(source, /submission && !isEditing && attachmentCount < 3/);
  assert.match(source, /if \(!wasAlreadySubmitted\)/);
  assert.match(source, /clearEvidenceFiles\(\)/);
  assert.match(photoOnlyFlow, /await uploadEvidence\(submission\.submissionId\)/);
  assert.doesNotMatch(photoOnlyFlow, /submitAnonymousCareTaskAction/);
  assert.doesNotMatch(submitFlow, /await uploadEvidence/);
  assert.match(actionSource, /uploadedPhotoIndexes\.push\(index\)/);
});
