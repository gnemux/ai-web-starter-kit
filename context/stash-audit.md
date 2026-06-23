# Stash Audit

## 2026-06-23 `codex-before-sync-main-20260623`

Audited stash:

```text
stash@{0}: On codex/analytics-dashboard-templates: codex-before-sync-main-20260623
stash commit: a639e98d229888530999b27406f53789ad90bb7a
base commit: bdb0d5612a91cde8f0349f12bb1d5a8538361c6e
```

Audit commands used:

```text
git diff --name-status stash@{0}^1 stash@{0}
git diff --stat origin/main stash@{0}
git diff --name-status origin/main stash@{0}
```

## Result

Do not apply this stash as a whole.

Reason: the stash was created before the current `main` absorbed later MVP2 work. Applying it directly would downgrade current `main`, especially around `apps/web/lib/services/payment.ts`, `apps/web/app/api/payment/webhook/route.ts`, `apps/web/lib/supabase/database.types.ts`, `integrations/scripts/creem-test-checkout.mjs`, and the `payment_events` migration. The stash is useful as an audit source, not as a patch to apply wholesale.

## MVP2 Module Judgment

| MVP2 area | Stash impact | Decision |
| --- | --- | --- |
| Integrations (`GNE-167`) | No newer provider-matrix/interface/env boundary than current `main`. Current `main` already contains the MVP2 integrations foundation and stage-boundary docs. | No restore needed. Keep current `main` as source of truth. |
| Billing (`GNE-71`) | No newer Billing migration/service facts than current `main`. | No restore needed. |
| Payment (`GNE-72`) | Useful historical Creem research notes exist, but runtime/service diffs are older than current `main` and would regress webhook, `payment_events`, and Creem processing. | Do not apply runtime diffs. Rewrite useful research/evidence from current facts into Payment docs. |
| AI (`GNE-148`) | Older AI failure-test/model wording and spec fragments exist. Current `main` already has AI foundation and safe analytics events. | Do not restore UI-only failure controls. Preserve only the rule that failure samples must come from service-level test fixtures, provider errors, or deployment smoke paths. |
| Analytics (`GNE-73`) | Useful PostHog dashboard/template and data-quality acceptance text is still needed for MVP2 reviewer visibility. | Merge Analytics content manually into current docs with current issue boundaries and without reverting code. |

## File Grouping

| Area | Files | Audit decision |
| --- | --- | --- |
| Payment runtime and provider wiring | `.env.example`, `apps/web/lib/providers/catalog.ts`, `apps/web/lib/providers/server.ts`, `apps/web/lib/services/payment.ts` | Superseded by current `main`; do not restore from stash. Current `main` has the fuller Creem test-mode adapter/webhook path. |
| Payment and Creem docs | `integrations/payment.md`, `integrations/payment-creem-research.md`, `specs/payment/*` | Partially useful history, but current project docs should be rewritten from current Linear and production evidence rather than restored from stash. |
| Analytics dashboard docs | `integrations/analytics.md` | Useful for `GNE-73` and still needed for MVP2 non-black-box reviewer acceptance. Merge manually from current facts and push through this docs update. |
| AI failure-event docs | `specs/ai/*`, `apps/web/lib/providers/ai-models.ts`, `apps/web/lib/i18n.ts` | Potentially useful for Analytics/AI observability follow-up, but not part of the Payment parent closure. Do not merge through this audit. |
| Project memory | `context/linear.md`, `context/status.md`, `context/environment-matrix.md` | Update from current facts instead of applying stale stash content. |

## Parent Issue Impact

The audit does not block `GNE-167 MVP2 INTEGRATIONS-00`, `GNE-71 MVP2 BILLING-00`, `GNE-72 MVP2 PAYMENT-00`, or `GNE-148 MVP2 AI-00`.

Parent closure should be judged from current Linear child issue states and the current repository state:

- `GNE-167` Integrations is Done for MVP2 provider matrix, env naming, adapter/interface landing points, and no-op/mock/sandbox behavior.
- `GNE-71` Billing is Done for MVP2 plan, entitlement, subscription, Credit, and ledger foundations.
- `GNE-72` Payment can be Done for MVP2: `PAYMENT-01..06`, `PAYMENT-04R`, optional `PAYMENT-07`, and optional `PAYMENT-08` are complete for sandbox/test-mode scope.
- `GNE-148` AI is Done for MVP2 mock/no-op provider, service boundary, Credit usage, quota, and safe analytics scope.
- `GNE-73` Analytics is Done for MVP2 shared event standards, production field verification, dashboard templates, multi-environment viewing rules, data-isolation checks, and AI/Payment observability positions. MVP3 activation events continue under the MVP3 Product Validation Kit, not as a remaining MVP2 blocker.
- Production payment remains explicitly out of scope and stays under `GNE-201`.

## Stash Handling

Keep the stash until the audit PR is merged and the team confirms the manually merged Analytics content is enough. Do not drop it automatically.
