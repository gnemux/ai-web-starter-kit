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
-> Supabase resetPasswordForEmail(email, redirectTo=/auth/recovery?...)
-> Recovery Email Template builds /auth/recovery#token_hash=...&type=recovery
-> GET renders a first-party interstitial without verifying the credential
-> explicit user POST verifies the recovery token hash
-> authenticated /auth/recovery/password page in a minimal Auth shell
-> server-side getUser verification
-> Supabase updateUser({ password })
-> success state with safe return action
```

The existing Supabase SSR cookie adapter remains the only session mechanism.
Reset callback construction accepts only a valid HTTP(S) application origin and
an app-local `/catcare` or `/account` return. The callback always points to the
fixed recovery interstitial; arbitrary caller-provided destinations cannot
replace it. The interstitial reads `token_hash` and fixed `type=recovery` from a
URL fragment, clears the fragment, never persists the credential, and sends it
only in an explicit same-origin POST. The recovery password page verifies the
user again before `updateUser` but intentionally avoids the signed-in CatCare
account shell. The separate `/account/password` route remains available for a
normal authenticated password change, while both routes consume one shared
form and one server-only Auth service.

The recovery route skips PostHog initialization entirely. Disabling individual
capture modes is insufficient because SDK initialization and feature-flag
requests may still read the current URL. No GET request verifies or forwards the one-time
credential, so email security scanners cannot consume it by prefetching the
link. Invalid, expired, and already-used tokens return bounded UI states and a
fresh reset-request action. The hosted Recovery Email Template is an operational
dependency and must use `{{ .RedirectTo }}#token_hash={{ .TokenHash
}}&type=recovery`; the repository records the template contract but never a
real token.

Reset requests use neutral success copy to avoid account enumeration. Provider
errors are mapped to bounded UI categories and never expose raw provider
payloads; `same_password` is a localized field validation state rather than a
false expired-link message. Password and email values remain inside the Auth
provider call and are not sent to Analytics, logs, Linear, or screenshots. No
schema or migration change is required.

Verification must cover input validation, safe-return normalization, callback
origin rejection, signed-out protection, valid recovery/session update,
scanner-safe GET behavior, explicit POST verification, expired/invalid recovery
handling, recovery-shell separation, same-password mapping, responsive UI,
typecheck, lint, tests, and build. The target Supabase
project's exact `/auth/recovery` URL must be in the Auth redirect allowlist and
its Recovery Email Template must match the documented contract before real
email delivery is release evidence.

## GNE-319 Private Media Architecture

```text
anonymous status form
-> existing share-token gate and idempotent care submission
-> status/Audit/Outbox committed first
-> browser validates a <= 15 MB JPG/PNG/WebP and precompresses it to <= 3 MB
-> server action receives the first actual selected File for required-photo validation
-> POST /api/catcare/share/submissions/:submissionId/attachments
   (raw token remains in request body, not the API path)
   (the client sends each prepared file separately; replaying the first is
   idempotent and every response returns the authoritative attachment count)
-> revalidate active token + published plan + scoped submission
-> Sharp decode / auto-orient / resize / WebP encode / metadata strip
-> service-role write to private care-evidence bucket
-> care_submission_attachments metadata row
-> authenticated owner-only proxy for preview or download
```

`care_tasks.photo_required` is a product flag, not a storage permission.
`care_submission_attachments` stores owner, plan, submission and optional task
relations plus position, private object path, normalized content type, bounded
dimensions/bytes, SHA-256, and creation time. Position is constrained to
`0..2` and unique per submission, which makes more than three rows impossible;
submission plus hash is unique so a same-file retry is idempotent.

The `care-evidence` bucket is private, accepts only `image/webp`, and has a 2 MB
object limit. It intentionally has no anon or authenticated `storage.objects`
policy. The anonymous upload route uses the service role only after validating
the raw share credential and its owner/plan/submission scope. The owner metadata
table grants authenticated users `SELECT` only under owner RLS; the application
then uses a server-side admin client to read the object after the owner check.
No signed or public object URL is returned, so token revocation and owner
authorization remain application-controlled.

Client evidence preprocessing accepts a selected JPG/PNG/WebP up to 15 MB,
decodes it in the browser, bounds its longest edge to 1600 px, and emits WebP
with bounded quality until the request file is no larger than 3 MB. The UI
shows a processing state and does not submit while preprocessing is incomplete.
The server remains authoritative: input validation still checks declared MIME,
a 4 MB evidence / 5 MB cat-photo bound, decoded JPEG/PNG/WebP format, a
40-million-pixel decoder ceiling, and single-frame content. Sharp auto-orients,
limits evidence to 1600 px and cat photos to 1200 px, emits WebP, and does not
retain metadata. A second lower-quality pass is used only when needed to stay
below 2 MB. The 4 MB server boundary intentionally leaves multipart headroom
under Vercel's 4.5 MB Function request limit and rejects clients that bypass
preprocessing. Cat upload replacement removes the old object after the database
update and removes a newly uploaded object if its database mutation fails.

Text and media are deliberately separate failure domains. Exceptions are never
blocked by camera or upload failure. A normal photo-required submission is
validated from actual server-received files, never from a client-reported
count. The server action uploads the first selection sequentially after the
text result is durable; the client retains failed local selections and retries
only media through the scoped route. Duplicate image hashes return the existing
attachment and the current database attachment count, so a lost response cannot
make a later retry display the wrong total. A concurrent unique conflict reloads
current attachments, returns the winning same-hash row, or reallocates a free
position with a bounded retry.
An insert failure removes the just-written object; cleanup failure is reported
instead of silently declaring success. Retained historical attachments follow
submission/plan retention;
automatic physical purging remains a separately governed lifecycle operation.

Supabase Free image transformations are not a dependency. Static CatCare
runtime PNG assets are precompressed to WebP in the repository, while the
runtime upload pipeline depends directly on pinned `sharp`. Product-specific
task, token, bucket, and evidence semantics remain in `apps/web` and the product
migration; nothing is moved into the clean template or `packages/*` in this
issue.

Plan-list presentation derives an `overdue` time state from `end_on` and one
server-computed Asia/Shanghai date passed to both grouping and card rendering.
This avoids a midnight hydration disagreement. Overdue published plans stay
durably published but are grouped as history, receive the no-wrap
`已结束·可补交` badge, and link to results.

Plan event relevance is a product-local pure policy evaluated against
`start_on`. It accepts an ongoing ranged event, or a point/ended event within
30 days when its type is health/medicine or severity is urgent, otherwise
within 14 days for watch severity. Normal events remain excluded, future events
are not pulled backward, and the existing per-cat maximum of four is applied
after the time filter. Event-derived task instructions include the source date.
