# Clean Template Candidate Quick Start Contract

## Status

This cold-start contract was approved by GNE-301 and implemented locally by
GNE-302. The commands below now exist and have passed the first isolated
candidate run. GNE-303 must repeat them from a fresh directory without borrowing
source-workspace caches and owns any separately approved external smoke.

## Prerequisites

- Node.js 22;
- pnpm 9.15.0;
- the repository-pinned Supabase CLI version selected by GNE-302;
- Docker/Colima only for the disposable local Supabase verification;
- no real provider key or shared cloud database access.

Before using a Supabase command, run `supabase --version` and the relevant
`--help`. The baseline migration itself must have been created by GNE-302 with
`supabase migration new foundation_baseline`; a template user does not rename
or recreate it.

## 1. Generate Into An Empty Directory

GNE-302 must expose one repository script with this stable interface:

```bash
pnpm template:generate \
  --config specs/template/fixtures/smoke-product.json \
  --output /tmp/xwlc-template-smoke
```

The exact internal script path is not part of the public contract. The command
must reject a non-empty output directory, unknown config keys, unsafe paths,
unclassified source inputs, and incomplete license/provenance data.

Expected result:

- output exists only after generation and verification complete;
- `template-version.json` records the full source commit, template/manifest
  version, package versions, lockfile hash, baseline filename/schema version,
  provider modes, and notices version;
- no `.git`, worktree metadata, `node_modules`, `.next`, `.turbo`, `.vercel`,
  `.env.local`, source absolute path, secret, CatCare, Demo, or MVP evidence is
  present.

The default command produces the neutral pristine candidate. To derive a real
single-product repository, prepare one reviewed configuration and run:

```bash
pnpm product:init -- --config /absolute/path/to/product.json
pnpm product:verify
```

`product:init` updates the declared product configuration/state, generated
TypeScript configuration and neutral local Supabase identity. If the configured
workspace root changes, it atomically moves the editable
`apps/web/app/(product)/<workspace-root>` subtree and rolls it back with the
config files on failure. It refuses platform-reserved or existing destination
routes and does not edit platform/package code. Replacing an already-derived
identity requires `--force`; normal product behavior belongs in
`apps/web/modules/product` and thin nested pages below the product route root.

## 2. Verify Determinism

```bash
pnpm template:generate \
  --config specs/template/fixtures/smoke-product.json \
  --output /tmp/xwlc-template-smoke-a

pnpm template:generate \
  --config specs/template/fixtures/smoke-product.json \
  --output /tmp/xwlc-template-smoke-b

pnpm template:compare \
  /tmp/xwlc-template-smoke-a \
  /tmp/xwlc-template-smoke-b
```

After the documented normalization allowlist, file paths, contents, modes,
lockfile, and manifest facts must match. GNE-302 may choose another internal
comparison implementation, but these two public script names and pass/fail
semantics must remain stable once published.

## 3. Install Without Source Caches

Change into one generated output and confirm it is not resolving dependencies
from the research worktree:

```bash
cd /tmp/xwlc-template-smoke-a
pnpm install --frozen-lockfile
pnpm test:package-boundaries
pnpm test:release-boundaries
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The generated workspace owns its local `packages/*` snapshot and lockfile. It
must not use `link:` paths or absolute paths pointing at `ai-web-starter-kit`.

## 4. Configure Local Safe Modes

```bash
# Choose exactly one path on a fresh checkout.
# Safe-disabled provider pages:
pnpm env:init

# Or real disposable local Auth/profile acceptance:
supabase start
pnpm env:init -- --supabase-local
```

Both commands create ignored `apps/web/.env.local` and refuse to overwrite an
existing file. Do not create a root `.env.local`: the Next application runs
from `apps/web`. The local option reads only the disposable CLI Project URL and
Publishable Key; it never writes a service-role key. Product identity is owned
by `product.config.json`, not duplicated in environment variables:

```text
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=local
NEXT_PUBLIC_RELEASE_VERSION=0.1.0
NEXT_PUBLIC_SUPABASE_URL=<local Project URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local Publishable key>
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Only the public URL and Publishable key from the disposable local instance are
needed. The candidate does not require a service-role key for local page use.
No PostHog key is needed while Analytics is disabled. Payment `sandbox` and AI
`mock` use deterministic no-side-effect adapters; external Payment/AI remain
`not_implemented` until a reviewed adapter exists, regardless of secret values.

After the database and public app environment are ready, run the protected
foundation and optional product suites against a production build:

```bash
pnpm exec playwright install chromium
pnpm test:browser
```

Before starting Supabase, inspect the generated local tooling inputs:

- `supabase/config.toml` has a neutral `project_id` derived from the product
  config, documented fixed local ports, and Auth site/redirect URLs matching the
  local app URL; it contains no research or cloud project identity;
- `supabase/seed.sql` is empty/comment-only or deterministic and product-neutral;
- `supabase/.gitignore` excludes local state and secrets;
- `supabase/README.md` describes the independent foundation baseline and forbids
  linking/resetting the shared cloud test project.

## 5. Rebuild A Disposable Empty Database

Do not link to, reset, or mutate the shared cloud test project.

```bash
supabase --version
supabase start
supabase db --help
supabase db reset
supabase db reset
pnpm test:database
```

Both resets must apply the single candidate baseline and produce the same schema
and deterministic neutral seed state. Verify:

- the migration ledger head equals the recorded baseline filename;
- retained foundation tables, constraints, indexes, triggers, RLS, and grants
  match the acceptance manifest;
- `demo_items`, CatCare/care tables, CatCare Storage, product Audit/Outbox event
  unions, and user/customer rows are absent;
- owner A cannot read/update owner B, anonymous roles cannot access protected
  tables, ownership cannot be transferred by UPDATE, and `payment_events`
  remains service-only.
- authenticated users can SELECT only their own Billing/Subscription/
  Entitlement/Credit/Usage facts and cannot INSERT, UPDATE, or DELETE them;
- `user_profiles` permits only owner SELECT/INSERT/UPDATE and no user DELETE;
- `set_updated_at()` has fixed `search_path` and no direct EXECUTE grant for
  `PUBLIC`, `anon`, or `authenticated`.

## 6. Start And Review Pages

```bash
pnpm dev
```

Review at least:

- `/` signed out and signed in;
- `/login` sign-in/sign-up/error and safe `next` behavior;
- `/account`, `/account/billing`, `/account/usage`;
- the configured product workspace root and its signed-out redirect;
- 404, loading, empty, error, and disabled Provider states;
- one mobile viewport and the accepted MVP3 desktop widths.

The neutral identity must be visible and no CatCare route, text, icon, image,
table, or navigation item may appear. Missing optional Provider configuration
must not break install, build, home, login, or account pages.

## 7. Inspect Security And Provenance

```bash
pnpm template:verify
git diff --check
```

The verification command must cover pollution/secret scanning, dependency and
asset notices, CSP including `frame-ancestors`, Referrer-Policy,
X-Content-Type-Options, session-cookie expectations, safe return paths, package
public-root boundaries, and manifest/source-version consistency.

## External Test Deployment Gate

Creating a new GitHub repository, pushing the candidate/Smoke Product, creating
or configuring a Vercel project, or entering cloud environment variables is not
part of this local Quick Start. GNE-303 performs those steps only after explicit
approval for the named target. Without approval, record `not_run` and return a
Conditional result rather than claiming independent deployment passed.

If approved later, Vercel uses Root Directory `apps/web`, Framework Preset
`Next.js`, workspace access outside the Root Directory, Install Command
`cd ../.. && pnpm install --frozen-lockfile`, Build Command
`cd ../.. && pnpm turbo run build --filter=@xwlc/web`, and Output Directory
`.next`. `apps/web/vercel.json` is the only candidate deployment configuration.
The research repository's automatic deployment after its own merge is not
candidate evidence.

## Cleanup

Generated directories and local Supabase containers are disposable, but do not
delete them automatically when they may contain reviewer evidence or user
changes. Record the paths and ask before destructive cleanup.
