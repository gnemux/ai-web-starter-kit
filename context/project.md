# Project Context

## Goal

Build a reusable commercial Web product starter kit for fast idea validation.

The starter kit should help the team move from:

```text
idea collection
-> product specification
-> AI-assisted implementation
-> MVP deployment
-> analytics and payment validation
-> marketing iteration
```

## Non-goals

- Do not build a complex enterprise platform in the first version.
- Do not optimize for high concurrency before product demand is validated.
- Do not hard-code one payment, analytics, or auth provider into business logic.
- Do not let generated code drift away from specs and status documents.

## Product Capability Tracks

1. Foundation and AI rules
2. Product shell and reusable UI
3. Data model, migrations, and permissions
4. API service layer and business access boundaries
5. Authentication and user account
6. Payment, billing, and entitlement
7. Analytics and monitoring
8. Deployment and operations
9. Growth and marketing
10. Documentation and examples

## MVP Stage Plan

The project uses Linear milestones for stage view and parent issues for module ownership.

```text
MVP1 基础底座
-> runnable app, Supabase Auth/Data/API, Vercel deploy rules, and base PostHog events

MVP2 扩展底座
-> provider matrix, Billing, Payment sandbox/contract, AI service boundary, and analytics verification

MVP3 Product Validation Kit
-> a realistic sample product that consumes MVP2 foundations to validate data, public pages, leads, growth, entitlement, payment, and AI usage

MVP4 海外/国内双模式真实 Provider 接入
-> turn MVP2 provider reservations into real overseas/china provider integrations and smoke paths
```

MVP2 is intentionally not a single giant implementation issue. `MVP2-KNOW-01` is a consensus document; execution remains under module parent issues such as `MVP2 INTEGRATIONS-00`, `MVP2 BILLING-00`, `MVP2 PAYMENT-00`, `MVP2 AI-00`, and `MVP1-MVP3 ANALYTICS-00`.

## Team Collaboration

Each capability track should have:

- a Linear parent issue
- small child issues
- one owner or rotating owner
- a spec under `specs/`
- integration notes when external services are involved
- clear acceptance checks

## Default Assumptions

- The first user-facing product will be a Web SaaS / Web App.
- The first deploy target is Vercel.
- The first auth and database provider is Supabase.
- Payment starts with a Sandbox Provider before real provider integration.
- Analytics starts with PostHog and keeps space for China-friendly providers.
- MVP3 should not be blocked by real Payment or real AI provider readiness. It uses sandbox/mock/no-op paths first, then runs real provider product acceptance through dedicated follow-up tasks when MVP2 provider readiness exists.
- MVP4 owns real overseas/china dual-mode provider rollout, including domestic payment, domestic AI, domestic analytics, cloud, CDN, SMS, email, storage, and compliance/deployment differences.
