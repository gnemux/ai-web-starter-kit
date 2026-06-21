# Billing Product Spec

## Scope

MVP2 Billing establishes the commercial source of truth for plans, prices, orders, subscriptions, entitlements, usage, credit, and quota. It lets later Payment, AI, Analytics, and product UI work consume one stable model instead of each module inventing its own subscription state.

## Goals

- Define reusable Billing language for commercial web products.
- Keep Payment, Billing, AI, and Analytics responsibilities separate.
- Provide a minimal Free / Pro / credit-pack model that can be reused by MVP3.
- Make entitlement checks available through a service boundary instead of page-local rules.
- Preserve provider neutrality so real payment providers can be added later without rewriting Billing.

## Non-goals

- Do not integrate a real payment provider.
- Do not process real money, refunds, tax, invoices, or reconciliation.
- Do not build a full pricing page, checkout flow, or account billing management UI in this issue.
- Do expose a minimal reviewer surface so Free / Pro / AI credit-pack assumptions can be checked by a teammate.
- Do not make Analytics, frontend success pages, or AI usage logs the Billing source of truth.
- Do not implement China/overseas dual real provider rollout; that belongs to MVP4.

## Core Concepts

| Concept | Meaning | Source of truth |
| --- | --- | --- |
| Plan | Product package such as Free or Pro. | Billing config |
| Price | Sellable price for a plan or credit pack. | Billing config, provider mapping later |
| Order | Server-side purchase fact from a trusted payment event. | Billing database |
| Subscription | Current recurring commercial state. | Billing database |
| Entitlement | What the user may access now. | Billing database plus Billing config |
| Usage | Measured consumption of a feature or quota. | Billing usage ledger |
| Credit | Granted and consumed allowance such as AI tokens. | Billing credit ledger |
| Quota | Limit attached to a plan, entitlement, or credit source. | Billing config and entitlement rows |

## Module Boundaries

- Payment creates checkout sessions and trusted server-side payment events. It does not decide final entitlement.
- Billing converts trusted events and admin grants into orders, subscriptions, entitlements, and ledgers.
- AI asks Billing before model calls and records usage after calls. It does not derive subscription state.
- Analytics observes conversion events and user behavior. It never grants or revokes access.
- UI reads Billing through service/API contracts. It must not assemble subscription state from multiple tables.

## Default MVP2 Product Model

| Plan | Audience | Included rights |
| --- | --- | --- |
| Free | New users and local demos | Limited projects, pages, leads, and a small AI token allowance |
| Pro monthly | Product validation and paid SaaS examples | Higher limits, custom-domain-ready entitlement, and larger AI token allowance |
| AI credit pack | Add-on | One-time token/credit grant that can be consumed by AI flows |

## Human Review

Review Billing as a business fact model, not just a visible page. A reviewer should be able to explain what happens for an unpaid user, a paid user, an expired subscription, and a user with consumed credits by reading specs, code contracts, and migration shape.

## MVP2 Ownership Map

These Billing assets belong to MVP2 because they define the commercial source of truth that Payment, AI, and MVP3 consume later:

| Asset | MVP2 responsibility | Reviewer check |
| --- | --- | --- |
| `packages/core/src/billing.ts` | Free / Pro / AI credit-pack config, entitlement helpers, lifecycle helpers, and ledger input builders | Free, Pro, and AI credit-pack defaults are present and provider-neutral |
| `specs/billing/*` | Domain model, acceptance criteria, engineering boundaries, and test plan | Reviewer can explain facts, states, edge cases, and non-goals without reading chat history |
| `supabase/migrations/20260621130735_create_billing_foundation.sql` | Orders, subscriptions, entitlements, credit ledger, usage ledger, RLS, service-role writes, and owner-readable facts | Local `supabase db reset` applies the migration and users can only read their own Billing facts |
| `apps/web/lib/services/billing.ts` | App service boundary for current entitlement snapshots and feature access decisions | Pages consume the Billing service instead of querying Billing tables or deriving rights locally |
| `/account` Billing section | Minimal human-visible reviewer surface | Free fallback, Free/Pro differences, and AI credit-pack reservation are visible without implying real checkout is complete |

MVP3 should not redefine these assets. MVP3 should consume them through product flows such as Free/Pro gating, sandbox checkout, AI generation, and analytics funnel verification.
