import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  buildPasswordRecoveryCallbackUrl,
  normalizePasswordResetRequest,
  normalizePasswordUpdate,
  requestPasswordResetWithAuth,
  updatePasswordWithAuth
} from "./password-recovery.ts";

test("password reset request normalizes email and keeps only product returns", () => {
  const valid = normalizePasswordResetRequest(
    "  Owner@Example.com ",
    "/catcare/plans/plan-1/results"
  );
  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.equal(valid.data.email, "owner@example.com");
    assert.equal(valid.data.nextPath, "/catcare/plans/plan-1/results");
  }

  const external = normalizePasswordResetRequest(
    "owner@example.com",
    "https://evil.example/steal"
  );
  assert.equal(external.ok, true);
  if (external.ok) assert.equal(external.data.nextPath, "/catcare");

  const invalid = normalizePasswordResetRequest("not-an-email", "/catcare");
  assert.equal(invalid.ok, false);
  if (!invalid.ok) assert.equal(invalid.error.fields?.email, "invalid");
});

test("password update requires a matching eight-character password", () => {
  const valid = normalizePasswordUpdate(
    "correct-horse",
    "correct-horse",
    "/account"
  );
  assert.equal(valid.ok, true);
  if (valid.ok) assert.equal(valid.data.nextPath, "/account");

  const invalid = normalizePasswordUpdate("short", "different", "//evil.example");
  assert.equal(invalid.ok, false);
  if (!invalid.ok) {
    assert.equal(invalid.error.fields?.password, "too_short");
    assert.equal(invalid.error.fields?.confirmPassword, "mismatch");
  }
});

test("recovery callback has a validated origin and a fixed protected destination", () => {
  const result = buildPasswordRecoveryCallbackUrl(
    "https://product.example/base",
    "/catcare/plans/plan-1/results?tab=recap"
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const callback = new URL(result.data);
  assert.equal(callback.origin, "https://product.example");
  assert.equal(callback.pathname, "/auth/confirm");
  assert.equal(
    callback.searchParams.get("next"),
    "/account/password?next=%2Fcatcare%2Fplans%2Fplan-1%2Fresults%3Ftab%3Drecap"
  );

  for (const origin of [
    "javascript:alert(1)",
    "https://user:pass@product.example",
    "not-a-url"
  ]) {
    assert.equal(buildPasswordRecoveryCallbackUrl(origin, "/catcare").ok, false);
  }
});

test("password reset calls the provider once and maps failures safely", async () => {
  const calls = [];
  const auth = createAuthMock({
    async resetPasswordForEmail(email, options) {
      calls.push({ email, options });
      return { error: null };
    }
  });

  const result = await requestPasswordResetWithAuth(
    auth,
    "owner@example.com",
    "https://product.example/auth/confirm?next=%2Faccount%2Fpassword"
  );

  assert.equal(result.ok, true);
  assert.deepEqual(calls, [
    {
      email: "owner@example.com",
      options: {
        redirectTo:
          "https://product.example/auth/confirm?next=%2Faccount%2Fpassword"
      }
    }
  ]);

  const failed = await requestPasswordResetWithAuth(
    createAuthMock({
      async resetPasswordForEmail() {
        return {
          error: {
            code: "provider_private_failure",
            message: "raw provider detail"
          }
        };
      }
    }),
    "owner@example.com",
    "https://product.example/auth/confirm"
  );

  assert.equal(failed.ok, false);
  if (!failed.ok) {
    assert.equal(failed.error.code, "system_error");
    assert.doesNotMatch(failed.error.message, /provider|raw/i);
  }
});

test("password update rejects anonymous sessions before provider mutation", async () => {
  let updates = 0;
  const result = await updatePasswordWithAuth(
    createAuthMock({
      async getUser() {
        return { data: { user: null }, error: null };
      },
      async updateUser() {
        updates += 1;
        return { error: null };
      }
    }),
    { nextPath: "/catcare", password: "correct-horse" }
  );

  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error.code, "unauthorized");
  assert.equal(updates, 0);
});

test("password update verifies the user and changes only the current session account", async () => {
  const updates = [];
  const result = await updatePasswordWithAuth(
    createAuthMock({
      async getUser() {
        return { data: { user: { id: "user-1" } }, error: null };
      },
      async updateUser(input) {
        updates.push(input);
        return { error: null };
      }
    }),
    { nextPath: "/account", password: "correct-horse" }
  );

  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.data.nextPath, "/account");
  assert.deepEqual(updates, [{ password: "correct-horse" }]);
});

test("Auth service keeps reset and update calls behind the server boundary", async () => {
  const source = await readFile(
    new URL("./password-recovery.ts", import.meta.url),
    "utf8"
  );
  const form = await readFile(
    new URL("../../app/account/password/password-form.tsx", import.meta.url),
    "utf8"
  );

  assert.match(source, /auth\.resetPasswordForEmail\(/);
  assert.match(source, /auth\.getUser\(\)/);
  assert.match(source, /auth\.updateUser\(\{/);
  assert.doesNotMatch(form, /createSupabase|service[_-]?role/i);
});

test("reset mode asks for email and omits the sign-in password field", async () => {
  const form = await readFile(
    new URL("../../app/login/auth-form.tsx", import.meta.url),
    "utf8"
  );

  assert.match(form, /id="email"[\s\S]*?name="email"/);
  assert.match(form, /\{!isReset \? <div>[\s\S]*?id="password"/);
});

test("password fields keep accessible errors until each rule is satisfied", async () => {
  const form = await readFile(
    new URL("../../app/account/password/password-form.tsx", import.meta.url),
    "utf8"
  );

  assert.match(form, /passwordValue\.length < 8/);
  assert.match(form, /confirmationValue !== passwordValue/);
  assert.match(form, /aria-invalid=\{passwordError\}/);
  assert.match(form, /aria-invalid=\{confirmationError\}/);
});

function createAuthMock(overrides = {}) {
  return {
    async getUser() {
      return { data: { user: { id: "user-1" } }, error: null };
    },
    async resetPasswordForEmail() {
      return { error: null };
    },
    async updateUser() {
      return { error: null };
    },
    ...overrides
  };
}
