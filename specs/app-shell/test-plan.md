# Test Plan: App Shell, Dashboard, And Edge States

## Automated Checks

```bash
pnpm typecheck
pnpm build
```

If global `pnpm` is unavailable, use the local workspace binaries or `npx --yes pnpm@9.15.0`.

## Manual Browser Checks

1. Open `/`.
2. Confirm first screen presents the template clearly and exposes only sign up and login entries.
3. Confirm landing content reads as a restrained, product-style first screen and does not show `当前已具备` or `Available now`.
4. Confirm unauthenticated landing header shows the login entry.
5. With a signed-in Supabase Auth session, reopen `/` and confirm the header shows an account trigger instead of Login.
6. Open the account menu and confirm it only shows Dashboard, Account settings, and Sign out.
7. Confirm sign out returns to `/` and the landing header returns to Login.
8. Confirm `Built in`, `Flow`, and public `Open dashboard` navigation/CTA labels are not visible.
9. Confirm the global footer contains brand copy, product links, product/engineering slot columns, copyright text, and the language switcher.
10. Switch language from the footer control to English, then back to Chinese; confirm the current route updates without losing layout.
11. Open `/login` and confirm sign in/sign up labels are localized.
12. Open `/dashboard`.
13. Confirm app shell primary navigation is visible and contains only Dashboard and Account.
14. Confirm the top header does not show Start, Data, Profile, Home, or another route-level nav group.
15. Confirm Dashboard focuses on demo data service functionality rather than milestone sample cards or status metric cards.
16. Confirm Dashboard does not show implementation-boundary explanation panels in the primary user workflow.
17. Open `/account` and confirm the page only shows current email, display name editing, and save feedback.
18. Confirm empty, loading, and error handling render without overlap where applicable.
19. Resize to mobile width and confirm navigation/content/footer/language switcher collapse safely.
20. Inspect page metadata/source and confirm the browser title, application name, and favicon are branded as `XWLC`.
21. Open `/icon.svg` and confirm the favicon renders a clear XWLC-compatible mark.

## Verification Record

- 2026-06-17: `npx --yes pnpm@9.15.0 typecheck` passed.
- 2026-06-17: `npx --yes pnpm@9.15.0 build` passed.
- 2026-06-17: Codex in-app browser verified `/` and `/dashboard`.
- 2026-06-17: Mobile viewport `390x1100` verified no horizontal overflow.
- 2026-06-19: `corepack pnpm typecheck` passed.
- 2026-06-19: `corepack pnpm lint` passed.
- 2026-06-19: `corepack pnpm build` passed.
- 2026-06-19: Codex in-app browser verified `/` default Chinese, language switch to English, `/login`, and unauthenticated `/dashboard` redirect.
- 2026-06-19: Mobile viewport `390x1100` verified no horizontal overflow on `/`.
- 2026-06-19: Browser verified public landing no longer shows `Built in`, `Flow`, `Open dashboard`, or visible Dashboard copy; `/login?next=/dashboard` shows exactly one global language switcher group.
- 2026-06-20: `corepack pnpm typecheck` and `corepack pnpm lint` passed after adding Auth-aware landing header.
- 2026-06-20: Codex in-app browser opened `http://localhost:3002/` from a dev server started with root `.env.local`; unauthenticated header shows Login and hidden roadmap labels remain absent.
- 2026-06-20: Codex in-app browser verified authenticated `/` shows an account trigger and opened menu with only Dashboard, account settings, and sign out.
- 2026-06-20: `corepack pnpm typecheck`, `corepack pnpm lint`, and `corepack pnpm build` passed after adding the global footer and moving the language switcher into it.
- 2026-06-20: Local dev server `http://127.0.0.1:3004/` returned localized Chinese and English footer HTML with product links, capability categories, engineering notes, copyright text, and one footer language switcher; the old fixed language switcher was absent.
- 2026-06-20: In-app browser tab attachment failed twice and `agent-browser` CLI was unavailable in this environment, so this pass used HTTP assertions instead of a visual browser screenshot.
- 2026-06-20: Authenticated app shell navigation was simplified so `/dashboard` and `/account` are the only primary nav items; duplicate top route nav labels were removed.
- 2026-06-20: Codex in-app browser verified authenticated `/dashboard` and `/account`: primary nav contains only Dashboard and Account, active state follows the current page, and the top header has no Start/Data/Profile route labels.
- 2026-06-20: `corepack pnpm typecheck` and `corepack pnpm lint` passed after removing non-functional Dashboard and Account status cards.
- 2026-06-20: Codex in-app browser verified authenticated `/dashboard` and `/account`: Dashboard main content only shows demo data read/create functionality, Account main content only shows email and display-name editing, and console errors were absent.
- 2026-06-20: `corepack pnpm typecheck` and `corepack pnpm lint` passed after clarifying footer placeholder copy; browser verified the footer now uses product/engineering placeholder wording and no longer shows the old capability/resource column labels.
- 2026-06-20: `corepack pnpm typecheck` and `corepack pnpm lint` passed after converting landing content into a product-promotion first screen; browser verified `/` shows the product-style sample copy and no longer shows `当前已具备` / `Available now`.
- 2026-06-20: `corepack pnpm typecheck` and `corepack pnpm lint` passed after retouching the landing first screen into a restrained product-style sample; browser verified `/` shows the sample first-screen copy, footer slot copy, and no old explicit template-instruction wording.
- 2026-06-20: `corepack pnpm typecheck` and `corepack pnpm lint` passed after tightening the landing typography and core layout; browser verified desktop layout has no overlapping sample cards and mobile `390px` width has no horizontal overflow.
- 2026-06-20: `corepack pnpm typecheck` and `corepack pnpm lint` passed after removing the landing header sample nav and lower three-column band; browser verified `/` no longer shows `产品 / 方案 / 资源` or `价值主张 / 产品界面 / 转化动作`.
- 2026-06-20: `corepack pnpm typecheck` and `corepack pnpm lint` passed after fixing sign-out navigation; browser verified authenticated landing logout fully returns to `/` and the header falls back to Login.
- 2026-06-20: `corepack pnpm typecheck` and `corepack pnpm lint` passed after moving successful logout navigation into the server action; reproduced the previous `/account` redirect to `/login?next=/account` before the fix and updated the action so protected pages share the same `/` logout destination.
- 2026-06-20: `corepack pnpm typecheck` and `corepack pnpm lint` passed after fixing the landing login regression. HTTP checks returned 200 for `/` and `/login`, unauthenticated `/dashboard` returned 307 to `/login?next=/dashboard`, and the in-app browser verified the header Login link opens `/login` with the sign-in form visible.
- 2026-06-21: `corepack pnpm typecheck`, `corepack pnpm lint`, and `corepack pnpm build` passed after updating the public app name defaults and favicon to XWLC. Local HTTP checks on `http://127.0.0.1:3005/` confirmed `<title>XWLC</title>`, `application-name=XWLC`, `apple-mobile-web-app-title=XWLC`, and `<link rel="icon" href="/icon.svg" type="image/svg+xml">`; `/icon.svg` returned 200 with `content-type: image/svg+xml`.
- Note: local `npm run build` fails before project build because this machine does not expose a global `pnpm` binary. The fixed pnpm command is the current reliable verification path.

## Edge Cases

- Long capability descriptions wrap inside their container.
- Status badges do not resize parent layout unexpectedly.
- Loading state keeps stable row dimensions.
- Error state provides a visible recovery action.
- Mobile layout avoids horizontal overflow.
- Chinese and English labels stay concise enough for buttons, nav, cards, and form fields.
