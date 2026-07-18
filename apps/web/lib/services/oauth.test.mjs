import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  buildSocialOAuthCallbackUrl,
  clearCurrentSessionForSocialOAuth,
  completeSocialOAuthWithAuth,
  normalizeSocialOAuthCode,
  normalizeSocialOAuthProvider,
  normalizeSocialOAuthStartInput,
  startSocialOAuthWithAuth
} from "./oauth.ts";
import { createSupabaseRouteCookieState } from "../supabase/route-cookie-state.ts";

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

test("an existing QQ password session switches to a distinct Google identity without account linking", async () => {
  const calls = [];
  let linkIdentityCalls = 0;
  const auth = createAuthMock({
    async getSession() {
      calls.push("get-session");
      return {
        data: { session: { user: { id: "qq-password-user" } } },
        error: null
      };
    },
    async signOut(input) {
      calls.push(`sign-out:${input.scope}`);
      return { error: null };
    },
    async signInWithOAuth(input) {
      calls.push(`sign-in:${input.provider}`);
      return {
        data: { url: "https://provider.example/authorize?state=opaque" },
        error: null
      };
    },
    async exchangeCodeForSession(code) {
      calls.push(`exchange:${code}`);
      return {
        data: {
          user: {
            email: "google-user@gmail.example",
            id: "google-user",
            identities: [{ provider: "google" }],
            user_metadata: { full_name: "Google User" }
          }
        },
        error: null
      };
    },
    async linkIdentity() {
      linkIdentityCalls += 1;
      throw new Error("different-email identities must not be linked");
    }
  });

  const switchResult = await clearCurrentSessionForSocialOAuth(auth);
  assert.deepEqual(switchResult, { data: { cleared: true }, ok: true });

  const startResult = await startSocialOAuthWithAuth(auth, {
    provider: "google",
    redirectTo: "https://product.example/auth/oauth/callback"
  });
  assert.equal(startResult.ok, true);

  const callbackResult = await completeSocialOAuthWithAuth(auth, {
    code: "a".repeat(32),
    provider: "google"
  });
  assert.deepEqual(callbackResult, {
    data: {
      displayNameCandidate: "Google User",
      email: "google-user@gmail.example",
      provider: "google",
      userId: "google-user"
    },
    ok: true
  });
  assert.equal(linkIdentityCalls, 0);
  assert.deepEqual(calls, [
    "get-session",
    "sign-out:local",
    "sign-in:google",
    `exchange:${"a".repeat(32)}`
  ]);
});

test("social OAuth does not sign out without a session and stops on cleanup failure", async () => {
  let signOutCalls = 0;
  const emptyResult = await clearCurrentSessionForSocialOAuth(
    createAuthMock({
      async getSession() {
        return { data: { session: null }, error: null };
      },
      async signOut() {
        signOutCalls += 1;
        return { error: null };
      }
    })
  );

  assert.deepEqual(emptyResult, { data: { cleared: false }, ok: true });
  assert.equal(signOutCalls, 0);

  const failedResult = await clearCurrentSessionForSocialOAuth(
    createAuthMock({
      async getSession() {
        return {
          data: { session: { user: { id: "password-user" } } },
          error: null
        };
      },
      async signOut() {
        return {
          error: { code: "raw_failure", message: "sensitive provider detail" }
        };
      }
    })
  );

  assert.equal(failedResult.ok, false);
  if (!failedResult.ok) {
    assert.equal(failedResult.error.code, "system_error");
    assert.doesNotMatch(failedResult.error.message, /raw|sensitive/i);
  }
});

test("OAuth route cookie transition removes every stale password chunk before installing Google chunks", async () => {
  const authCookie = "sb-project-auth-token";
  const verifierCookie = `${authCookie}-code-verifier`;
  const staleCookies = [0, 1, 2].map((index) => ({
    name: `${authCookie}.${index}`,
    value: `stale-qq-${index}`
  }));
  const startCookieState = createSupabaseRouteCookieState(staleCookies);
  const startAuth = createAuthMock({
    async getSession() {
      return {
        data: { session: { user: { id: "qq-password-user" } } },
        error: null
      };
    },
    async signOut(input) {
      assert.deepEqual(input, { scope: "local" });
      startCookieState.setAll(
        staleCookies.map(({ name }) => ({
          name,
          options: { maxAge: 0, path: "/" },
          value: ""
        })),
        { "Cache-Control": "private, no-store" }
      );
      return { error: null };
    },
    async signInWithOAuth() {
      startCookieState.setAll(
        [
          {
            name: verifierCookie,
            options: { httpOnly: true, path: "/", sameSite: "lax" },
            value: "opaque-pkce"
          }
        ],
        { "Cache-Control": "private, no-store" }
      );
      return {
        data: { url: "https://provider.example/authorize?state=opaque" },
        error: null
      };
    }
  });

  assert.equal((await clearCurrentSessionForSocialOAuth(startAuth)).ok, true);
  assert.equal(
    (
      await startSocialOAuthWithAuth(startAuth, {
        provider: "google",
        redirectTo: "https://product.example/auth/oauth/callback"
      })
    ).ok,
    true
  );

  const startResponse = createCookieResponseMock();
  startCookieState.applyToResponse(startResponse.response);
  assert.deepEqual(
    startResponse.mutations
      .filter(({ options }) => options.maxAge === 0)
      .map(({ name }) => name),
    staleCookies.map(({ name }) => name)
  );
  const callbackRequestCookies = applyCookieMutations(
    staleCookies,
    startResponse.mutations
  );
  assert.deepEqual(callbackRequestCookies, [
    { name: verifierCookie, value: "opaque-pkce" }
  ]);

  const callbackCookieState = createSupabaseRouteCookieState(
    callbackRequestCookies
  );
  const callbackAuth = createAuthMock({
    async exchangeCodeForSession() {
      callbackCookieState.setAll(
        [
          {
            name: verifierCookie,
            options: { maxAge: 0, path: "/" },
            value: ""
          },
          {
            name: `${authCookie}.0`,
            options: { httpOnly: true, path: "/", sameSite: "lax" },
            value: "google-session-0"
          },
          {
            name: `${authCookie}.1`,
            options: { httpOnly: true, path: "/", sameSite: "lax" },
            value: "google-session-1"
          }
        ],
        { "Cache-Control": "private, no-store" }
      );
      return {
        data: {
          user: {
            email: "google-user@gmail.example",
            id: "google-user",
            identities: [{ provider: "google" }]
          }
        },
        error: null
      };
    }
  });
  const completion = await completeSocialOAuthWithAuth(callbackAuth, {
    code: "b".repeat(32),
    provider: "google"
  });
  assert.equal(completion.ok, true);
  if (completion.ok) assert.equal(completion.data.userId, "google-user");

  const callbackResponse = createCookieResponseMock();
  callbackCookieState.applyToResponse(callbackResponse.response);
  const protectedRequestCookies = applyCookieMutations(
    callbackRequestCookies,
    callbackResponse.mutations
  );
  assert.deepEqual(protectedRequestCookies, [
    { name: `${authCookie}.0`, value: "google-session-0" },
    { name: `${authCookie}.1`, value: "google-session-1" }
  ]);
  assert.equal(
    protectedRequestCookies.some(({ value }) => value.includes("stale-qq")),
    false
  );
  assert.equal(
    callbackResponse.response.headers.get("Cache-Control"),
    "private, no-store"
  );
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
  const routeClient = await readFile(
    new URL("../supabase/route.ts", import.meta.url),
    "utf8"
  );
  const routeCookieState = await readFile(
    new URL("../supabase/route-cookie-state.ts", import.meta.url),
    "utf8"
  );
  const proxyClient = await readFile(
    new URL("../supabase/proxy.ts", import.meta.url),
    "utf8"
  );
  const serverClient = await readFile(
    new URL("../supabase/server.ts", import.meta.url),
    "utf8"
  );
  const form = await readFile(
    new URL("../../app/login/auth-form.tsx", import.meta.url),
    "utf8"
  );

  assert.match(startRoute, /clearCurrentSessionForSocialOAuth/);
  assert.match(startRoute, /createSupabaseRouteClient/);
  assert.match(startRoute, /applyToResponse/);
  assert.match(startRoute, /getSocialOAuthProviderAvailability/);
  assert.match(callbackRoute, /completeSocialOAuthWithAuth/);
  assert.match(callbackRoute, /ensureAuthenticatedUserProfile/);
  assert.match(callbackRoute, /createSupabaseRouteClient/);
  assert.match(callbackRoute, /applyToResponse/);
  assert.match(`${startRoute}\n${callbackRoute}`, /force-dynamic/);
  assert.match(routeClient, /setAll\(cookiesToSet, headers\)/);
  assert.match(routeClient, /createSupabaseRouteCookieState/);
  assert.match(routeCookieState, /Cache-Control/);
  assert.match(proxyClient, /setAll\(cookiesToSet, headers\)/);
  assert.match(proxyClient, /response\.headers\.set/);
  assert.doesNotMatch(serverClient, /cache\(async function/);
  assert.doesNotMatch(
    `${startRoute}\n${callbackRoute}\n${providerSettings}`,
    /error_description|access_token|refresh_token|id_token|client_secret|\.p8/
  );
  assert.match(providerSettings, /\/auth\/v1\/settings/);
  assert.match(providerSettings, /providerSettingsTimeoutMs = 3_000/);
  assert.match(
    providerSettings,
    /AbortSignal\.timeout\(providerSettingsTimeoutMs\)/
  );
  assert.match(form, /pendingProvider/);
  assert.match(form, /aria-busy/);
  assert.match(form, /focus-visible:ring/);
  assert.doesNotMatch(form, /cursor-not-allowed[\s\S]{0,200}后续接入/);
});

test("Apple deferred decision is visible and cannot start an unavailable OAuth flow", async () => {
  const [formSource, dictionarySource] = await Promise.all([
    readFile(new URL("../../app/login/auth-form.tsx", import.meta.url), "utf8"),
    readFile(new URL("../i18n/dictionaries.ts", import.meta.url), "utf8")
  ]);

  assert.match(formSource, /const deferred = provider === "apple"/);
  assert.match(formSource, /disabled=\{pendingProvider !== null \|\| deferred\}/);
  assert.match(formSource, /labels\.appleDeferred/);
  assert.match(dictionarySource, /Apple 登录暂未开放/);
  assert.match(dictionarySource, /Apple sign-in is not available yet/);
});

function createAuthMock(overrides = {}) {
  return {
    async exchangeCodeForSession() {
      return { data: { user: null }, error: null };
    },
    async signInWithOAuth() {
      return { data: { url: null }, error: null };
    },
    async getSession() {
      return { data: { session: null }, error: null };
    },
    async signOut() {
      return { error: null };
    },
    ...overrides
  };
}

function createCookieResponseMock() {
  const mutations = [];
  return {
    mutations,
    response: {
      cookies: {
        set(name, value, options) {
          mutations.push({ name, options, value });
        }
      },
      headers: new Headers()
    }
  };
}

function applyCookieMutations(initialCookies, mutations) {
  const cookies = new Map(
    initialCookies.map(({ name, value }) => [name, value])
  );
  for (const { name, options, value } of mutations) {
    if (options.maxAge === 0) cookies.delete(name);
    else cookies.set(name, value);
  }
  return Array.from(cookies, ([name, value]) => ({ name, value }));
}
