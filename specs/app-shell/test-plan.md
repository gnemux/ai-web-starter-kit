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
3. Confirm `Built in`, `Flow`, and public `Open dashboard` navigation/CTA labels are not visible.
4. Switch language from the global control to English, then back to Chinese; confirm the current route updates without losing layout.
5. Open `/login` and confirm sign in/sign up labels are localized.
6. Open `/dashboard`.
7. Confirm app shell navigation is visible and readable.
8. Confirm Dashboard focuses on account, profile, and demo data service functionality rather than milestone sample cards.
9. Confirm empty, loading, error and long content handling render without overlap where applicable.
10. Resize to mobile width and confirm navigation/content/language switcher collapse safely.

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
- Note: local `npm run build` fails before project build because this machine does not expose a global `pnpm` binary. The fixed pnpm command is the current reliable verification path.

## Edge Cases

- Long capability descriptions wrap inside their container.
- Status badges do not resize parent layout unexpectedly.
- Loading state keeps stable row dimensions.
- Error state provides a visible recovery action.
- Mobile layout avoids horizontal overflow.
- Chinese and English labels stay concise enough for buttons, nav, cards, and form fields.
