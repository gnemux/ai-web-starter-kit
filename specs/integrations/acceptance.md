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
