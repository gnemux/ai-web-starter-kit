# API Test Plan

## Static Boundary Checks

Run:

```bash
rg -n "@supabase/(ssr|supabase-js)" apps/web/app apps/web/components packages
rg -n "SUPABASE_(SECRET|SERVICE_ROLE)|sb_secret_" apps/web/app apps/web/components packages
git grep -n "sb_publishable_"
```

Expected:

- No Supabase SDK imports in page or component code.
- No secret/service-role references in app UI or core packages.
- No publishable key committed to tracked files.

## Type and Lint Checks

Run:

```bash
pnpm typecheck
pnpm lint
```

Expected:

- All TypeScript projects pass.
- Server action, service result, and Supabase helper types compile.

## Local Runtime Checks

With local or staging Supabase env values in `.env.local`:

1. Open `/dashboard` signed out.
2. Confirm API service demo renders a structured unauthorized state.
3. Submit an empty or short title and confirm validation error appears.
4. Open `/api/demo-items` signed out and confirm it returns `401` with `unauthorized`.
5. After M4 Auth provides sign-in, create a private item and confirm it appears in the list.
6. After M4 Auth provides sign-in, open `/api/demo-items` in the same browser session and confirm it returns the authenticated user's service result.

## Database Checks

M3 does not add a migration. It reuses M2:

- `public.demo_items`
- `public.user_profiles`
- RLS policies applied through M2 migrations

Run `supabase db reset` if migration files change in future API work.

## Verification Log

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- `supabase db reset` passed after running with local CLI file-system permission.
- Boundary grep passed: no Supabase SDK imports in `apps/web/app`, `apps/web/components`, or `packages`.
- Boundary grep passed: no `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or `sb_secret_` references in app UI or packages.
- `git grep -n "sb_publishable_"` returned no tracked publishable key.
- Browser check passed at `http://localhost:3001/dashboard`: API service demo rendered, missing session surfaced as `unauthorized`, and short title submission surfaced `validation_error`.
