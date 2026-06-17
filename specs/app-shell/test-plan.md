# Test Plan: App Shell, Dashboard, And Edge States

## Automated Checks

```bash
pnpm typecheck
pnpm build
```

If global `pnpm` is unavailable, use the local workspace binaries or `npx --yes pnpm@9.15.0`.

## Manual Browser Checks

1. Open `/`.
2. Confirm first screen presents the template clearly and exposes a Dashboard entry.
3. Open `/dashboard`.
4. Confirm app shell navigation is visible and readable.
5. Confirm readiness metrics, capability tracks, next actions and integration status render.
6. Confirm empty, loading, error and long content examples render without overlap.
7. Resize to mobile width and confirm navigation/content collapse safely.

## Verification Record

- 2026-06-17: `npx --yes pnpm@9.15.0 typecheck` passed.
- 2026-06-17: `npx --yes pnpm@9.15.0 build` passed.
- 2026-06-17: Codex in-app browser verified `/` and `/dashboard`.
- 2026-06-17: Mobile viewport `390x1100` verified no horizontal overflow.
- Note: local `npm run build` fails before project build because this machine does not expose a global `pnpm` binary. The fixed pnpm command is the current reliable verification path.

## Edge Cases

- Long capability descriptions wrap inside their container.
- Status badges do not resize parent layout unexpectedly.
- Loading state keeps stable row dimensions.
- Error state provides a visible recovery action.
- Mobile layout avoids horizontal overflow.
