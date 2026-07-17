import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  buildSocialOAuthCallbackUrl,
  completeSocialOAuthWithAuth,
  normalizeSocialOAuthCode,
  normalizeSocialOAuthProvider,
  normalizeSocialOAuthStartInput,
  startSocialOAuthWithAuth
} from "./oauth.ts";

test("social OAuth accepts only Google and Apple and allowlists product returns", () => {
  assert.equal(normalizeSocialOAuthProvider("google").ok, true);
  assert.equal(normalizeSocialOAuthProvider("APPLE").ok, true);

  for (const provider of [null, "github", "google%00apple"]) {
    assert.equal(normalizeSocialOAuthProvider(provider).ok, false);
  }

  const valid = normalizeSocialOAuthStartInput(
    "google",
    "/catcare/plans/plan-1?tab=results"
  );
  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.equal(valid.data.provider, "google");
    assert.equal(valid.data.nextPath, "/catcare/plans/plan-1?tab=results");
  }

  for (const nextPath of [
    "https://evil.example/steal",
    "//evil.example/steal",
    "/catcare-admin",
    "/dashboard"
  ]) {
    const result = normalizeSocialOAuthStartInput("apple", nextPath);
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.data.nextPath, "/catcare");
  }
});

test("social OAuth callback uses a validated origin and clean local route", () => {
  const result = buildSocialOAuthCallbackUrl(
    "https://product.example/base",
    "google",
    "/account/billing?tab=plans"
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const callback = new URL(result.data);
  assert.equal(callback.origin, "https://product.example");
  assert.equal(callback.pathname, "/auth/oauth/callback");
  assert.equal(callback.searchParams.get("provider"), "google");
  assert.equal(callback.searchParams.get("next"), "/account/billing?tab=plans");

  for (const origin of [
    "javascript:alert(1)",
    "https://user:pass@product.example",
    "not-a-url"
  ]) {
    assert.equal(
      buildSocialOAuthCallbackUrl(origin, "apple", "/catcare").ok,
      false
    );
  }
});

test("social OAuth callback codes are bounded and URL-safe", () => {
  assert.equal(normalizeSocialOAuthCode("a".repeat(32)).ok, true);

  for (const code of [
    null,
    "too-short",
    "a".repeat(2049),
    `${"a".repeat(32)}&next=https://evil.example`
  ]) {
    assert.equal(normalizeSocialOAuthCode(code).ok, false);
  }
});

test("social OAuth start calls the selected provider once and returns its authorize URL", async () => {
  const calls = [];
  const result = await startSocialOAuthWithAuth(
    createAuthMock({
      async signInWithOAuth(input) {
        calls.push(input);
        return {
          data: { url: "https://provider.example/authorize?state=opaque" },
          error: null
        };
      }
    }),
    {
      provider: "google",
      redirectTo:
        "https://product.example/auth/oauth/callback?provider=google&next=%2Fcatcare"
    }
  );

  assert.equal(result.ok, true);
  assert.deepEqual(calls, [
    {
      options: {
        redirectTo:
          "https://product.example/auth/oauth/callback?provider=google&next=%2Fcatcare",
        skipBrowserRedirect: true
      },
      provider: "google"
    }
  ]);
});

test("social OAuth start never exposes raw provider failures or unsafe navigation", async () => {
  for (const response of [
    {
      data: { url: null },
      error: { code: "secret_failure", message: "raw provider detail" }
    },
    { data: { url: "javascript:alert(1)" }, error: null }
  ]) {
    const result = await startSocialOAuthWithAuth(
      createAuthMock({
        async signInWithOAuth() {
          return response;
        }
      }),
      { provider: "apple", redirectTo: "https://product.example/callback" }
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.code, "system_error");
      assert.doesNotMatch(result.error.message, /secret|raw|provider detail/i);
    }
  }
});

test("Google callback exchanges once and returns only bounded account fields", async () => {
  const calls = [];
  const result = await completeSocialOAuthWithAuth(
    createAuthMock({
      async exchangeCodeForSession(code) {
        calls.push(code);
        return {
          data: {
            user: {
              email: " Owner@Example.com ",
              id: "user-1",
              identities: [{ provider: "email" }, { provider: "google" }],
              user_metadata: {
                access_token: "must-not-escape",
                full_name: "  Owner Name  "
              }
            }
          },
          error: null
        };
      }
    }),
    { code: "a".repeat(32), provider: "google" }
  );

  assert.equal(result.ok, true);
  assert.deepEqual(calls, ["a".repeat(32)]);
  if (result.ok) {
    assert.deepEqual(result.data, {
      displayNameCandidate: "Owner Name",
      email: "owner@example.com",
      provider: "google",
      userId: "user-1"
    });
    assert.equal("access_token" in result.data, false);
  }
});

test("Apple callback ignores provider name and rejects missing/mismatched identities", async () => {
  const apple = await completeSocialOAuthWithAuth(
    createAuthMock({
      async exchangeCodeForSession() {
        return {
          data: {
            user: {
              email: "owner@privaterelay.appleid.com",
              id: "user-2",
              identities: [{ provider: "apple" }],
              user_metadata: { full_name: "Provider supplied name" }
            }
          },
          error: null
        };
      }
    }),
    { code: "b".repeat(32), provider: "apple" }
  );

  assert.equal(apple.ok, true);
  if (apple.ok) assert.equal(apple.data.displayNameCandidate, null);

  const mismatched = await completeSocialOAuthWithAuth(
    createAuthMock({
      async exchangeCodeForSession() {
        return {
          data: {
            user: {
              email: "owner@example.com",
              id: "user-3",
              identities: [{ provider: "google" }]
            }
          },
          error: null
        };
      }
    }),
    { code: "c".repeat(32), provider: "apple" }
  );

  assert.equal(mismatched.ok, false);
  if (!mismatched.ok) {
    assert.equal(mismatched.error.code, "unauthorized");
    assert.doesNotMatch(mismatched.error.message, /identity|google|raw/i);
  }
});

test("OAuth routes and UI keep secrets out and expose real pending controls", async () => {
  const startRoute = await readFile(
    new URL("../../app/auth/oauth/start/route.ts", import.meta.url),
    "utf8"
  );
  const callbackRoute = await readFile(
    new URL("../../app/auth/oauth/callback/route.ts", import.meta.url),
    "utf8"
  );
  const providerSettings = await readFile(
    new URL("./oauth-provider-settings.ts", import.meta.url),
    "utf8"
  );
  const form = await readFile(
    new URL("../../app/login/auth-form.tsx", import.meta.url),
    "utf8"
  );

  assert.match(startRoute, /createSupabaseServerClient/);
  assert.match(startRoute, /getSocialOAuthProviderAvailability/);
  assert.match(callbackRoute, /completeSocialOAuthWithAuth/);
  assert.match(callbackRoute, /ensureAuthenticatedUserProfile/);
  assert.doesNotMatch(
    `${startRoute}\n${callbackRoute}\n${providerSettings}`,
    /error_description|access_token|refresh_token|id_token|client_secret|\.p8/
  );
  assert.match(providerSettings, /\/auth\/v1\/settings/);
  assert.match(providerSettings, /AbortSignal\.timeout\(1_500\)/);
  assert.match(form, /pendingProvider/);
  assert.match(form, /aria-busy/);
  assert.match(form, /focus-visible:ring/);
  assert.doesNotMatch(form, /cursor-not-allowed[\s\S]{0,200}后续接入/);
});

function createAuthMock(overrides = {}) {
  return {
    async exchangeCodeForSession() {
      return { data: { user: null }, error: null };
    },
    async signInWithOAuth() {
      return { data: { url: null }, error: null };
    },
    ...overrides
  };
}
