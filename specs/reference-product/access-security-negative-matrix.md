# CatCare ACCESS Security Negative Matrix

## Scope

This matrix closes `GNE-260` for the ACCESS stage. It records which private-link
and anonymous-submit negative paths are already covered, which evidence proves
them, and which audit requirements must be implemented later by CAP-02.

## Non-goals

- No `audit_events` table or Audit facade implementation here; CAP-02 owns that.
- No UI or anonymous-flow change.
- No new Cloudflare, Hono, D1, KV, or Queue adapter.
- No raw share token, real customer data, screenshots, or secrets in evidence.

## Negative Matrix

| Scenario | Expected result | Current evidence | Foundation classification |
| --- | --- | --- | --- |
| Owner A reads Owner B CatCare rows | Rejected by owner boundary; zero rows or RLS denial | `supabase/tests/catcare_access_boundary.sql`; `supabase/tests/catcare_owner_rls.sql` | `common_pattern_not_extracted`: owner scope verified, still product service-local |
| Owner A creates/revokes Owner B share token | Rejected; zero rows or RLS denial | `supabase/tests/catcare_share_token_security.sql`; `supabase/tests/catcare_share_link_management.sql` | `common_pattern_not_extracted` |
| Owner A submits into Owner B plan | Rejected by owner/plan/task boundary | `supabase/tests/catcare_access_boundary.sql`; `supabase/tests/catcare_owner_rls.sql` | `common_pattern_not_extracted` |
| Valid anonymous token views plan | Only minimal sitter view; no owner nav, account data, ids, token hash, Billing, AI, or Payment | GNE-257 browser QA; `getAnonymousCarePlanView` filters by resolved `ownerId` and `resourceId` | `common_contract_verified` for token gate and minimal DTO shape |
| Expired token | Explicit expired state; no task list; no submit | GNE-257 online token QA; `resolveCarePlanShareToken` expiry check | `common_contract_verified` |
| Revoked token | Explicit revoked state; no task list; no submit | GNE-257 online token QA; `resolveCarePlanShareToken` revocation check | `common_contract_verified` |
| Tampered/invalid token | Invalid state; no task list; no submit | GNE-257 invalid-token QA; `hashShareTokenSecret` and token lookup | `common_contract_verified` |
| Repeated link generation | Old link revoked; new link becomes active; existing submissions remain plan-slot visible | GNE-258 regeneration acceptance; `createCarePlanShareLink` revokes active token before insert | `common_pattern_not_extracted` |
| Duplicate anonymous submit | No duplicate result row for same plan/date/visit/task; update/duplicate path returned | `anonymous-submission-policy.test.mjs`; GNE-258 online verification | `common_contract_verified` for idempotency boundary |
| Forwarded valid link | Bearer can access only the one scoped plan minimum surface | GNE-257 valid token QA; GNE-259 app-layer scope evidence | `common_contract_verified` |
| Direct anonymous DB read | Cannot read private CatCare tables or `share_tokens` directly | `supabase/tests/catcare_access_boundary.sql` | `common_pattern_not_extracted` |
| Direct anonymous DB write | Cannot write `share_tokens` or `care_submissions` directly | `supabase/tests/catcare_access_boundary.sql` | `common_pattern_not_extracted` |
| Direct anonymous submit action with wrong task/date/visit | Rejected by server validation; hidden form fields are not trusted | `submitAnonymousCareSubmissionFromFormData`; `anonymous-submission-policy.test.mjs` | `common_contract_verified` for whitelist/date/visit checks |
| Raw token leakage in analytics/logs/docs/evidence | Raw token must not be sent or recorded | `specs/reference-product/gne-278-product-flow.md`; GNE-257/GNE-258/GNE-290 evidence notes; `rg` review for ACCESS evidence | `common_pattern_not_extracted` |

## Audit Requirements For CAP-02

CAP-02 should implement these audit events through the platform Audit facade.
This issue defines the contract only.

| Event | Trigger | Allowed fields | Forbidden fields |
| --- | --- | --- | --- |
| `share_link_created` | Owner creates/regenerates a link | `actor_type=user`, `owner_id`, `resource_type=care_plan`, `resource_id`, `token_record_id`, `expires_at`, `correlation_id` | raw token, token hash, owner email, plan notes |
| `share_link_revoked` | Owner revokes a link or regenerate revokes the previous link | `actor_type=user`, `owner_id`, `resource_type`, `resource_id`, `token_record_id`, `revoked_at`, `correlation_id` | raw token, token hash |
| `share_page_viewed` | Anonymous valid token resolves to a plan | `actor_type=anonymous_token`, `token_record_id`, `resource_type`, `resource_id`, `expires_at`, `correlation_id` | raw token, token hash, owner email, private care notes |
| `invalid_or_revoked_token_rejected` | Invalid, expired, revoked, or unavailable token is rejected | `actor_type=anonymous_token`, `reason`, `resource_type` when known, `correlation_id` | raw token, token hash, submitted note |
| `care_submission_created` | Anonymous sitter creates or updates a task result | `actor_type=anonymous_token`, `owner_id`, `resource_type=care_plan`, `resource_id`, `task_id`, `service_date`, `visit_time`, `status`, `abnormal`, `idempotency_key`, `correlation_id` | raw token, token hash, full note text, private handoff notes |
| `owner_boundary_denied` | Owner attempts cross-owner read/write | `actor_type=user`, `owner_id`, `resource_type`, `resource_id`, `reason`, `correlation_id` | target owner private data, customer content |

## Field Rules

- Raw token is display-once only and must never enter logs, analytics, audit,
  outbox, screenshots, Linear, PR text, or committed docs.
- Token hash is a database lookup secret and must not enter analytics or audit
  payloads.
- Notes and handoff content are product data. Audit may store counts/statuses,
  not full text.
- `submitted_by_label` is not identity proof; audit must treat anonymous submit
  as `actor_type=anonymous_token`.
- `idempotency_key` is allowed because it is needed to reason about duplicate
  prevention, but it must not contain the raw token. Current plan-scoped format
  satisfies that rule.

## Cloudflare + Hono Portability Judgment

Current status: `common_pattern_not_extracted`.

What survives a future CF/Hono + D1/KV/Queues path:

- Token gate is centralized in `resolveCarePlanShareToken`.
- Anonymous context is explicit: `actorType`, `tokenId`, `ownerId`,
  `resourceType`, `resourceId`, `scope`, `expiresAt`.
- Owner flows resolve the authenticated owner and keep explicit `owner_id`
  filters before mutating share links or plans.
- Submission whitelist and date/visit/task validation are server-side.
- Duplicate protection uses a plan/date/visit/task idempotency boundary rather
  than only a page-level disabled state.

Migration risks to carry into CAP-02 / future platform work:

- Current runtime uses Supabase service-role reads for anonymous plan display;
  a no-RLS store must preserve the same owner/resource/task filters in its
  repository adapter.
- `correlation_id` is defined by platform contracts but is not yet propagated
  through every CatCare ACCESS service call.
- Audit and outbox are contracts only in ACCESS; CAP-02 must implement durable
  storage and safe payload redaction before claiming `common_contract_verified`
  for audit.
- Product objects remain CatCare-specific: `care_plans`, `care_tasks`, and
  `care_submissions` fields must not be counted as common foundation APIs.

## VERIFY-03 Reuse

VERIFY-03 can reuse this file as the checklist, then attach fresh evidence for:

- linked Supabase SQL runs,
- owner A/B browser or API checks,
- valid/expired/revoked/invalid `/s/[token]` checks,
- duplicate submit checks,
- raw-token evidence scan,
- audit payload checks after CAP-02 exists.
