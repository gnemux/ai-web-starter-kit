import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (name) => readFile(new URL(name, import.meta.url), "utf8");

test("shared UI owns semantic tokens and reusable component styles", async () => {
  const css = await source("./styles.css");
  for (const token of ["--ui-color-success", "--ui-color-warning", "--ui-color-error", "--ui-space-4", "--ui-radius-lg"]) assert.match(css, new RegExp(token));
  for (const contract of [".button", ".field-error", ".notice-success", ".dialog-close", ".toast"]) assert.ok(css.includes(contract));
});

test("dialog and toast provide explicit dismissal contracts", async () => {
  assert.match(await source("./dialog.tsx"), /Close dialog/);
  const toast = await source("./toast.tsx");
  assert.match(toast, /setTimeout/);
  assert.match(toast, /Dismiss notification/);
});
