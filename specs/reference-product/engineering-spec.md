# Engineering Spec: MVP3 Reference Product

## Scope

GNE-231 adds the Reference Product homepage, login context, owner-side data model, service boundary, protected workspace, and product capability entry slots. It proves an app/product module can consume package public contracts without moving cat-care objects into reusable packages.

## Affected Areas

- `apps/web/app/catcare`
- `apps/web/app/page.tsx`
- `apps/web/app/login`
- `apps/web/app/demo`
- `apps/web/lib/catcare`
- `apps/web/lib/supabase/database.types.ts`
- `apps/web/lib/i18n.ts`
- `apps/web/components/account-menu.tsx`
- `apps/web/components/workspace-nav.tsx`
- `apps/web/components/site-footer.tsx`
- `supabase/migrations`
- `context/*`
- `specs/reference-product/*`

## Architecture

```text
CatCare homepage
-> CatCare login/signup context
-> protected /catcare workspace
-> app-side Reference Product Server Actions
-> app-side Reference Product service
-> Supabase client adapter in apps/web
-> public cats / care_routines / care_routine_items / care_items / care_events
-> public care_plans / care_tasks / care_submissions
-> RLS owner scope
```

The product pages may import public contracts from `@xwlc/core`, `@xwlc/ui`, `@xwlc/platform`, and `@xwlc/db`. Product rows, product state, product forms, and product copy stay in `apps/web`. The existing foundation demo stays available through `/demo`, `/demo/login`, and `/dashboard`; it is not the product first screen.

`/login` and `/demo/login` share the same AuthForm and Auth service. They differ only by page shell, default return path, and copy.

## Data Model

### `public.cats`

- `id uuid primary key`
- `owner_id uuid not null references auth.users(id)`
- `name text not null`
- optional life stage, breed, safety notes
- `notes text`
- timestamps

### `public.care_routines`

- `id uuid primary key`
- `owner_id uuid not null references auth.users(id)`
- `cat_id uuid not null references public.cats(id)`
- `title text not null`
- `source text not null`: `manual`, `template`, `ai_assisted`
- `is_default boolean not null`
- optional notes, timestamps

### `public.care_routine_items`

- `id uuid primary key`
- `routine_id uuid not null references public.care_routines(id)`
- `category text not null`: meal, water, litter, medicine, treat, play, environment, other
- `title text not null`
- frequency, optional time hint, optional instructions, enabled flag, sort order, timestamps

### `public.care_items`

- `id uuid primary key`
- `owner_id uuid not null references auth.users(id)`
- `cat_id uuid not null references public.cats(id)`
- `item_type text not null`: dry food, wet food, treat, medicine, litter, supply, other
- `name text not null`
- optional default amount, frequency, instructions
- `visible_to_sitter boolean not null`
- timestamps

### `public.care_events`

- `id uuid primary key`
- `owner_id uuid not null references auth.users(id)`
- `cat_id uuid not null references public.cats(id)`
- `event_type text not null`: feeding, treat, health, medicine, vet, travel, behavior, environment, other
- `title text not null`
- optional note and related item name
- `severity text not null`: `normal`, `watch`, `urgent`
- occurrence date or date range, timestamps

### `public.care_plans`

- `id uuid primary key`
- `owner_id uuid not null references auth.users(id)`
- optional legacy primary `cat_id`; it is cleared when that cat is archived
- optional `routine_id`
- `title text not null`
- `status text not null`: `draft`, `published`, `reviewed`, `closed`
- `scenario text not null`: business trip, weekend away, friend visit, other
- `generation_source text not null`: `manual`, `template`, `ai_mock`
- `ai_input_summary jsonb not null`
- optional start/end dates, handoff notes, generation/lifecycle timestamps, timestamps

### `public.care_plan_cats`

- immutable plan participant rows with `plan_id`, optional live `cat_id`,
  `cat_name_snapshot`, optional `cat_deleted_at`, and `sort_order`
- every newly created plan writes one participant row per selected cat
- plan and result pages use these snapshots; an archived participant is shown
  as `猫名（已删除）`

### Cat profile lifecycle

- Owner-facing delete is always logical deletion through
  `soft_delete_cat_profile`; normal clients have no `cats` hard-delete grant.
- A draft/published plan or active share link blocks archival. Reviewed/closed
  history does not block it.
- Active-plan and participant writes acquire a database row lock on every live
  cat, while archival locks the same rows before checking blockers. This
  serializes plan creation/publishing against archival instead of relying on a
  stale RLS statement snapshot.
- Every plan is inserted as `draft`; publishing is a separate transition that
  succeeds only after all relational participants are present and active.
- Archived cats and their mutable routines, routine items, care items, events,
  and item assignments are hidden by RLS. Rows are retained for audit and a
  separately governed future retention/purge workflow.
- `cat-photos` is a private bucket. The database stores an owner-scoped object
  path, while active photos are returned only through the authenticated
  `/api/catcare/cat-photos/:catId` route. Storage read/update/delete policies
  require both ownership and a live cat reference, so archived photos are not
  listable or retrievable even through legacy public URLs.
- Plans, tasks, submissions, recap data, and participant name snapshots remain
  readable. Archival writes an atomic `cat_profile_archived` audit event.
- Mutable owner/product reads are not cached in process-local memory; only the
  global active product catalog may use a bounded shared cache.

### `public.care_tasks`

- `id uuid primary key`
- `plan_id uuid not null references public.care_plans(id)`
- `category text not null`
- `title text not null`
- optional instructions, time hint, frequency, source label, source reference
- sort order, required flag, enabled flag, timestamps

### `public.care_submissions`

- `id uuid primary key`
- `owner_id uuid not null references auth.users(id)`
- `plan_id uuid not null references public.care_plans(id)`
- optional `task_id`
- sitter display label, status, optional note, created timestamp
- abnormal flag and optional idempotency key for ACCESS/CAPABILITY handoff

`share_tokens` and anonymous progress persistence are intentionally not created in GNE-231. GNE-232 owns token scope, expiry, revocation, replay behavior, anonymous visibility, token-hash safety, and token-bound write whitelists.

## UI States

- Homepage: visitors see a CatCare product proposition and product-shaped preview, with a secondary foundation demo link.
- Login: users sign in or sign up in CatCare context and default back to `/catcare`.
- Demo entry: reviewers can open `/demo` and `/demo/login` to validate foundation-demo flows without leaving the old UI implied by `/dashboard` as the product entry.
- Workspace default: signed-in owner sees profile/routine/checklist entry points, plan state, and product account capability entries.
- Empty: no plan list shows a product empty state.
- Loading: Server Action submit buttons show pending labels.
- Error: service failure uses the shared error state.
- Success: form footer confirms saved cat or plan.

## External Providers

- Supabase Auth supplies the owner identity.
- Supabase Database stores owner-scoped product rows.
- Shared account, billing, and usage pages remain the current entry points for account, plan/payment, and AI Credit review.

No new provider env vars are introduced by GNE-231.

## Security

- Secrets: no service-role key enters browser code.
- Permissions: every new public table has RLS enabled and owner-only policies.
- User data: owners can access only their own cats, routines, routine items, care items, events, plans, tasks, and submissions.
- Abuse cases: anonymous write paths, share tokens, rate limits, and private-link negative tests are deferred to GNE-232/GNE-260.

## Rollout

- Local: run `supabase db reset`, typecheck, lint, package-boundary test, build, and browser smoke.
- Preview: PR review uses local verification because PR branches do not auto-deploy.
- Production: main deployment smoke belongs to later MVP3 verification after PRODUCT, ACCESS, and CAPABILITY create the full reviewer path.

## Open Questions

- Whether product-specific plan tiers will mirror `/account/billing` or use a dedicated product billing page after GNE-233.
- Whether ACCESS stores sitter draft progress in a dedicated table or derives it from token-scoped final submissions.

## GNE-318 Account Recovery Architecture

```text
/login?mode=reset&next=<safe CatCare/account path>
-> server-side reset request
-> Supabase resetPasswordForEmail(email, redirectTo=/auth/confirm?...)
-> Supabase allowlisted email callback
-> /auth/confirm exchanges code or verifies recovery token hash
-> authenticated /account/password page
-> server-side getUser verification
-> Supabase updateUser({ password })
-> success state with safe return action
```

The existing Supabase SSR cookie adapter remains the only session mechanism.
Reset callback construction accepts only a valid HTTP(S) application origin and
an app-local `/catcare` or `/account` return. The callback itself always points
to the protected password page; arbitrary caller-provided destinations cannot
replace it. The password page is protected by middleware and verifies the user
again before `updateUser`.

Reset requests use neutral success copy to avoid account enumeration. Provider
errors are mapped to bounded UI categories and never expose raw provider
payloads. Password and email values remain inside the Auth provider call and
are not sent to Analytics, logs, Linear, or screenshots. No schema or migration
change is required.

Verification must cover input validation, safe-return normalization, callback
origin rejection, signed-out protection, valid recovery/session update,
expired/invalid recovery handling, responsive UI, typecheck, lint, tests, and
build. The target Supabase project's exact `/auth/confirm` URL must be in the
Auth redirect allowlist before real email delivery is release evidence.
