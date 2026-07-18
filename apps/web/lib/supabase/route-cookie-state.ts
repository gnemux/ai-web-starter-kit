import type { CookieOptions } from "@supabase/ssr";

export type SupabaseCookieMutation = {
  name: string;
  options: CookieOptions;
  value: string;
};

type CookieResponse = {
  cookies: {
    set(name: string, value: string, options: CookieOptions): unknown;
  };
  headers: Headers;
};

export function createSupabaseRouteCookieState(
  initialCookies: ReadonlyArray<{ name: string; value: string }>
) {
  const cookieState = new Map(
    initialCookies.map(({ name, value }) => [name, value])
  );
  const pendingCookies = new Map<string, SupabaseCookieMutation>();
  const pendingHeaders = new Map<string, string>();

  return {
    getAll() {
      return Array.from(cookieState, ([name, value]) => ({ name, value }));
    },
    setAll(
      cookiesToSet: SupabaseCookieMutation[],
      headers: Record<string, string>
    ) {
      for (const cookie of cookiesToSet) {
        const scopeKey = [
          cookie.options.domain ?? "",
          cookie.options.path ?? "",
          cookie.name
        ].join("|");

        pendingCookies.set(scopeKey, cookie);
        if (cookie.options.maxAge === 0) {
          cookieState.delete(cookie.name);
        } else {
          cookieState.set(cookie.name, cookie.value);
        }
      }

      for (const [name, value] of Object.entries(headers)) {
        pendingHeaders.set(name, value);
      }
    },
    applyToResponse<TResponse extends CookieResponse>(response: TResponse) {
      for (const { name, value, options } of pendingCookies.values()) {
        response.cookies.set(name, value, options);
      }

      for (const [name, value] of pendingHeaders) {
        response.headers.set(name, value);
      }

      if (!response.headers.has("Cache-Control")) {
        response.headers.set("Cache-Control", "private, no-store");
      }

      return response;
    }
  };
}
