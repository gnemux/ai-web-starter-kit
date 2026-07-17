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
