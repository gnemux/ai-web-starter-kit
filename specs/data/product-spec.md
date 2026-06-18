# Data Product Spec

## Summary

M2 DATA establishes the starter kit's minimum reusable data foundation: a user profile table, one demo business table, seed data guidance, and permission expectations. The goal is to give every later feature track a predictable place to store user-owned data without inventing table and RLS patterns from scratch.

## User

- Primary user: developers building products from this starter kit.
- Secondary user: AI agents implementing Auth, API, Billing, Payment, Analytics, and Growth tasks.

## Problem

Without a small data template, every feature can invent its own schema, ownership model, and permission rules. That makes Auth, Billing, Payment, and Growth harder to review and increases the chance of leaking user data or putting privileged logic in the browser.

## Goals

- Define the minimum reusable data model for `user_profiles` and `demo_items`.
- Provide a migration-backed schema and RLS pattern for user-owned data.
- Provide safe seed data guidance for local development.
- Make the DATA track a dependency for M3 API and M4 Auth.

## Non-goals

- Do not implement a full multi-tenant organization model.
- Do not add team roles, invitations, billing records, or analytics event storage.
- Do not connect to a shared staging or production Supabase project.
- Do not commit real users, customer data, provider keys, or service role keys.

## User Journey

```text
developer starts a DATA issue
-> reads specs and Supabase workflow
-> applies migration locally
-> resets local database with seed data
-> verifies profile and demo item permissions
-> reuses the model from API/Auth tasks
```

## Requirements

- `user_profiles` stores one profile row per Supabase Auth user.
- `demo_items` stores a minimal user-owned business record that later API examples can read and create.
- All exposed tables must enable RLS.
- Users can read and update their own profile.
- Users can read and manage their own demo items.
- Public demo items can be readable by authenticated users.
- Privileged service-only behavior must stay outside browser code.
- Seed data must remain local-only and must not include real personal data.

## Edge States

- Empty: a new user has no `demo_items` yet.
- Loading: API or page examples can show pending profile/demo item reads.
- Error: database or migration failures are surfaced through service-layer results in M3.
- Permission denied: non-owners cannot update another user's profile or private demo item.
- Long content: demo item titles and notes should be bounded in UI and validation layers.

## Success Metrics

- Activation: developers can run from an empty local database to working profile/demo tables.
- Retention: later feature tracks reuse the same ownership and RLS pattern.
- Conversion: Auth/API tracks can build against this schema without redesigning storage.
- Quality: `supabase db reset`, typecheck, and build are part of the acceptance path when local Supabase is available.
