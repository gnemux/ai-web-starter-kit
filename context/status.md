# Project Status

## Phase

Initialization.

## Completed

- Created initial repository structure.
- Added AI-readable project context and rules.
- Added SDD templates.
- Added integration document templates.
- Added monorepo package layout.
- Initialized local Git metadata.
- Created the Linear baseline issue tree under project `98f7dceca282`.
- Installed dependencies and generated `pnpm-lock.yaml`.
- Verified TypeScript projects and Next.js production build.
- Updated Linear milestones to match the M0-M7 project delivery tracks.
- Marked completed Linear issues as Done.
- Created GitHub private repository `gnemux/ai-web-starter-kit` and pushed the initial baseline to `origin/main`.
- Added Supabase collaboration workflow for local databases, Git migrations, staging, production, RLS, and PR checks.
- Created Linear issue `GNE-116` and project document for Supabase collaboration.
- Implemented app shell, Dashboard framework, and UI edge states for `GNE-82`, `GNE-84`, and `GNE-85`.
- Added Linear M2 DATA and M3 API milestones before Auth.
- Completed M2 DATA with specs, local Supabase config, migration, seed guidance, shared TypeScript data model types, and RLS verification.
- Synced M2 DATA Linear issues to Done.
- Documented Supabase remote link and Auth environment rules for collaborators.
- Applied M2 DATA migrations to Supabase staging project `nglilxhkuqzswbwitbdu`.
- Hardened staging after Supabase advisors by fixing `set_updated_at` search path, optimizing RLS policies, and revoking public execution of `rls_auto_enable()`.
- Completed M3 API with reusable service result types, Supabase client/server helper boundaries, a demo `demo_items` service path, dashboard service example, and local verification.
- Added Linear issue `GNE-163` so M4 Auth includes PostHog analytics instrumentation.
- Added M4 Auth specs and implemented Supabase Auth services, protected routes, account/profile UI, and PostHog Auth event wrappers.

## Done Issues

- `GNE-11` FOUNDATION-00
- `GNE-14` FOUNDATION-01
- `GNE-76` FOUNDATION-02
- `GNE-77` FOUNDATION-03
- `GNE-78` FOUNDATION-04
- `GNE-79` FOUNDATION-05
- `GNE-80` FOUNDATION-06
- `GNE-70` APP-00
- `GNE-81` APP-01
- `GNE-83` APP-03
- `GNE-82` APP-02
- `GNE-84` APP-04
- `GNE-85` APP-05
- `GNE-106` DEPLOY-01
- `GNE-107` DEPLOY-02
- `GNE-132` DATA-00
- `GNE-134` DATA-01
- `GNE-135` DATA-02
- `GNE-136` DATA-03
- `GNE-137` DATA-04
- `GNE-138` DATA-05
- `GNE-133` API-00
- `GNE-139` API-01
- `GNE-140` API-02
- `GNE-141` API-03
- `GNE-142` API-04
- `GNE-143` API-05

## In Progress Issues

- `GNE-5` AUTH-00
- `GNE-90` AUTH-06

## In Progress

- M4 Auth is implemented locally and awaiting real Supabase Auth signup/login verification with a test account.

## Next Steps

1. Verify M4 with a real Supabase Auth test account and email confirmation behavior.
2. Confirm PostHog events in the target PostHog project after environment variables are configured.
3. Keep `SUPABASE_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` out of browser code and `NEXT_PUBLIC_` variables.
4. Add generated Supabase database types in a later API/Auth hardening pass if the schema grows.

## Risks

- External providers are documented but not configured.
- No secrets should be added to the repository.
- Local machine exposes `pnpm@9.15.0`.
- Local Supabase runs through Colima; analytics is disabled locally because the Supabase vector container cannot mount Colima's Docker socket path.
- Staging performance advisors currently include only expected unused-index INFO entries until `demo_items` receives representative query traffic.
- M4 Auth needs both Supabase environment variables and PostHog environment variables in local, preview, and production deployments.
- Full Auth verification may require the user to receive an email confirmation or enter test credentials in the browser.
