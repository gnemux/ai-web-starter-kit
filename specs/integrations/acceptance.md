# Integrations Acceptance

## GNE-180 Acceptance

- Provider matrix exists in the repository, not only in chat or Linear.
- Matrix covers Auth, Database/BaaS, Analytics, Payment, AI, Email, Storage, SMS, and Deploy/CDN.
- Each provider class states:
  - current real provider or current state
  - overseas default or candidate
  - china candidate or MVP4 reservation
  - local/test strategy
  - MVP2 action
  - MVP4 follow-up
  - server-only boundary
  - whether `NEXT_PUBLIC_` is allowed
- README or context docs point reviewers to the matrix.
- Email, Storage, and SMS have integration placeholders so future work has a documented landing point.
- No real keys, tokens, webhook secrets, service-role keys, private provider payloads, customer data, or account screenshots are committed.

## Reviewer Questions

A reviewer should be able to answer:

- What providers are already real?
- What providers are currently sandbox/mock/no-op?
- What provider work must wait for MVP4?
- Where should a later Payment, AI, Email, Storage, or SMS implementation start?

## GNE-181 Acceptance

- `packages/core` exports provider-neutral contracts without importing Next.js, Supabase, PostHog, payment, email, storage, SMS, or AI SDKs.
- `apps/web/lib/providers` exists as the app-side adapter landing point.
- Payment has a sandbox adapter contract but no real payment SDK, checkout provider secret, or webhook implementation.
- AI has a mock adapter contract but no real model provider SDK or provider key.
- Email, Storage, and SMS have no-op adapters only.
- Analytics has a client-safe facade over the existing PostHog helper.
- Supabase Auth and Database remain behind `apps/web/lib/services/*` and `apps/web/lib/supabase/*`; they are not deeply providerized in this task.
- Server-only adapters are isolated from client components.
- No real keys, tokens, webhook secrets, service-role keys, private provider payloads, customer data, or account screenshots are committed.

## GNE-181 Reviewer Questions

- Can a later Payment, AI, Email, Storage, or SMS issue start from a clear contract and adapter file?
- Did this task avoid rewriting working Supabase and PostHog paths?
- Are real provider SDKs and secrets still absent?
- Can client code accidentally import server-only adapters?
