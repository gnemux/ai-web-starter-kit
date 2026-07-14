import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { buildEmailConfirmationUrl } from "./confirmation-url.ts";
import { normalizeInternalReturn } from "../navigation/internal-return.ts";

test("auth surface includes signup, profile update and protected account children", async () => {
  const actions = await readFile(new URL("./actions.ts", import.meta.url), "utf8");
  assert.match(actions, /export async function signUp/);
  assert.match(actions, /export async function updateProfile/);
  for (const relative of ["../../../app/account/page.tsx", "../../../app/account/billing/page.tsx", "../../../app/account/usage/page.tsx"]) {
    assert.match(await readFile(new URL(relative, import.meta.url), "utf8"), /redirect\(/);
  }
});

test("signup confirmation uses the trusted app origin and a safe local return", () => {
  const safeNext = normalizeInternalReturn("//evil.example", "/product");
  const callback = new URL(buildEmailConfirmationUrl("https://smoke.example/base", safeNext));
  assert.equal(callback.origin, "https://smoke.example");
  assert.equal(callback.pathname, "/auth/confirm");
  assert.equal(callback.searchParams.get("next"), "/product");
  assert.throws(() => buildEmailConfirmationUrl("javascript:alert(1)", "/product"), /Invalid app origin/);
});

test("local Supabase allowlist matches generated confirmation callbacks", async () => {
  const config = await readFile(new URL("../../../../../supabase/config.toml", import.meta.url), "utf8");
  for (const origin of ["http://localhost:3000", "http://127.0.0.1:3000"]) {
    const callback = `${origin}/auth/confirm`;
    assert.ok(config.includes(`"${callback}**"`));
    assert.ok(buildEmailConfirmationUrl(origin, "/product").startsWith(`${callback}?next=`));
  }
});

test("confirmation exchange keeps cookies and forbids caching", async () => {
  const route = await readFile(new URL("../../../app/auth/confirm/route.ts", import.meta.url), "utf8");
  for (const contract of ["response.cookies.set(name, value, options)", "Object.entries(headers)", '"Cache-Control", "private, no-store, max-age=0"', '"Pragma", "no-cache"', '"Expires", "0"']) assert.ok(route.includes(contract));
  assert.ok(route.includes("exchangeCodeForSession"));
});
