# API Acceptance

## GNE-139 API-01

- [x] Page, service, provider helper, and database boundaries are documented.
- [x] Server action versus route handler guidance is documented.
- [x] Auth, Billing, and Payment can reuse the same service boundary.

## GNE-140 API-02

- [x] Browser Supabase helper uses only public environment variables.
- [x] Server Supabase helper uses cookie-aware SSR client creation.
- [x] Admin helper is isolated to server-side helper code and requires a server-only key.
- [x] Missing Supabase config returns a structured configuration error.

## GNE-141 API-03

- [x] `listDemoItems` reads `demo_items` through the service layer.
- [x] `createDemoItemFromFormData` creates `demo_items` through the service layer.
- [x] Dashboard page calls services/server actions instead of raw database queries.
- [x] `GET /api/demo-items` exposes a route-handler check that reuses the service layer.

## GNE-142 API-04

- [x] `packages/core` exposes reusable `ServiceResult<T>` and `ServiceError` types.
- [x] Validation, unauthorized, forbidden, conflict, not found, configuration, and system errors are distinct.
- [x] UI displays success, validation, unauthorized/configuration, and system-style messages from service results.

## GNE-143 API-05

- [x] Supabase SDK imports are centralized under `apps/web/lib/supabase`.
- [x] Dashboard page and client form do not import Supabase SDK.
- [x] No service role or secret key is required in browser code.
- [x] Verification commands recorded in `specs/api/test-plan.md`.
