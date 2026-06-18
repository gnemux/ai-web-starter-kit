# API Product Spec

## Goal

M3 establishes the reusable business access template for the commercial starter kit. It gives future Auth, Billing, Payment, Analytics, and Growth work a clear place to put use-case logic instead of scattering provider calls through pages.

## Users

- Primary user: developers and AI agents implementing product modules.
- Secondary user: reviewers checking whether privileged logic is kept out of client code.

## Problem

M2 created the minimal data model, but pages still need a stable way to read and write data. Without an API/service layer, each feature can directly call Supabase, handle auth differently, and leak provider errors or privileged keys into the wrong boundary.

## Scope

- Define page, server action, route handler, service, provider, and database boundaries.
- Add Supabase browser/server/admin helper examples.
- Add a demo service for `demo_items`.
- Add reusable service result and error types.
- Show a dashboard path that calls service methods instead of raw database queries.

## Non-Goals

- Full Auth UI and protected route enforcement. That belongs to M4.
- Generated Supabase database types from remote schema.
- Admin-only product workflows that require a real `SUPABASE_SECRET_KEY`.
- A public REST API contract for external consumers.

## User Journey

```text
Dashboard page
-> calls listDemoItems service
-> service validates auth with Supabase server client
-> service queries demo_items under RLS
-> page renders success, empty, unauthorized, or system state
```

For create:

```text
Dashboard form
-> server action
-> createDemoItemFromFormData service
-> core input validation
-> Supabase insert under RLS
-> unified ServiceResult returned to UI
```

## Success Criteria

- Pages and client components do not import Supabase SDK directly.
- Service methods return `ServiceResult<T>`.
- Validation, unauthorized, forbidden, conflict, not found, configuration, and system errors are distinguishable.
- The service_role/secret key path is server-only and not required for normal demo operations.
- M4 Auth can reuse the same client/server helper pattern.
