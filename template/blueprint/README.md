# Clean product candidate

This repository is a generated, single-product starting point. It contains one deployable web app, local workspace snapshots of four neutral foundation packages, and one independent database baseline. It contains no research-product runtime or migration history.

## Start locally

1. Use Node 22 and pnpm 9.15.0.
2. Copy `.env.example` to an ignored `.env.local` only when configuring optional providers.
3. Run `pnpm install --frozen-lockfile`.
4. Run `pnpm test`, `pnpm lint`, `pnpm typecheck`, and `pnpm build`.
5. Run `supabase start`, then `supabase db reset` only against the disposable local project.
6. Run `pnpm --filter @xwlc/web dev` and review `/`, `/login`, `/account`, `/account/billing`, `/account/usage`, and `/product`.

## Customize safely

Keep one untouched generated copy as the candidate evidence. In the new product repository, edit `product.config.json`, then run `pnpm product:init`. To import a separate config, run `pnpm product:init -- --config /path/product.json`; replacing an already-derived identity requires `--force`. Initialization may change only the product config, its generated TypeScript projection, `product-state.json`, and the local Supabase project id. Run `pnpm product:verify` and `pnpm template:verify` afterwards: the latter normalizes those four reviewed outputs and still proves that the remaining foundation matches its signed candidate provenance.

Product-specific code belongs in `apps/web/modules/product`; platform application adapters belong in `apps/web/modules/platform`; provider-free contracts belong in `packages/*`. Routes stay thin and only compose product modules. A real product receives its own repository, deployment, environment, and migration history.

Provider modes are safe-disabled or sandbox by default. Do not claim live Analytics, Payment, AI, email, storage, or production database readiness until the selected product performs its own gated verification.
