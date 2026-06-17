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
3. Authentication and user account
4. Payment, billing, and entitlement
5. Analytics and monitoring
6. Deployment and operations
7. Growth and marketing
8. Documentation and examples

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
