# API Engineering Spec

## Ownership

- Linear milestone: `M3 API Service 层与业务访问模板`
- Parent issue: `GNE-133`
- Child issues: `GNE-139` through `GNE-143`

## Boundaries

### Page and Component Layer

Allowed:

- Render UI states from a service result.
- Call server actions for mutations.
- Call server-side services from server components.

Not allowed:

- Import `@supabase/supabase-js` or `@supabase/ssr` directly.
- Read `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY`.
- Normalize provider errors or encode business permissions.

### Server Action and Route Handler Layer

Allowed:

- Translate framework inputs such as `FormData`, `Request`, and search params.
- Call service methods.
- Revalidate paths or return serializable service results.

Use a server action when the operation is primarily app UI form behavior. Use a route handler when an HTTP boundary is needed for webhooks, external clients, or non-form programmatic access.

### Service Layer

Allowed:

- Own business use cases such as `listDemoItems` and `createDemoItem`.
- Validate inputs through `packages/core`.
- Check auth and permissions.
- Map provider errors to `ServiceResult<T>`.

Not allowed:

- Return raw provider exceptions to the UI.
- Depend on React or page components.

### Provider Helper Layer

Allowed:

- Create Supabase browser, server, and admin clients.
- Centralize environment variable checks.
- Keep service-only keys in server-only files.

`apps/web/lib/supabase/client.ts` only uses public values. `apps/web/lib/supabase/server.ts` owns cookie-aware server clients and the admin client factory.

### Core Package

Allowed:

- Shared result types.
- Pure validation and normalization.
- Provider-independent business contracts.

Not allowed:

- Next.js imports.
- Supabase SDK imports.

## Implemented Files

- `packages/core/src/api.ts`
- `apps/web/lib/supabase/config.ts`
- `apps/web/lib/supabase/client.ts`
- `apps/web/lib/supabase/server.ts`
- `apps/web/lib/supabase/database.types.ts`
- `apps/web/lib/services/demo-items.ts`
- `apps/web/app/dashboard/actions.ts`
- `apps/web/app/api/demo-items/route.ts`
- `apps/web/app/dashboard/demo-item-form.tsx`
- `apps/web/app/dashboard/page.tsx`

## Data Access

`listDemoItems` requires an authenticated Supabase session. It validates the JWT with `supabase.auth.getClaims()` and applies an explicit filter for rows owned by the current user or marked `visibility = 'public'`.

`createDemoItem` validates title, notes, and visibility before inserting. Ownership is set server-side from the authenticated user id.

`GET /api/demo-items` reuses `listDemoItems` for route-handler verification. It returns the same `ServiceResult<T>` shape and maps service error codes to HTTP status codes. It is not an anonymous public data endpoint; unauthenticated requests should return `unauthorized`.

## Error Model

All service methods return:

```ts
type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ServiceError };
```

Supported error codes:

- `validation_error`
- `unauthorized`
- `forbidden`
- `not_found`
- `conflict`
- `configuration_error`
- `system_error`

## Security Notes

- Public browser code can use `NEXT_PUBLIC_SUPABASE_URL` and a publishable key only.
- Server helpers support `SUPABASE_SECRET_KEY` and legacy `SUPABASE_SERVICE_ROLE_KEY`, but the demo service does not require either.
- Provider errors are mapped to safe messages before reaching the UI.
- RLS remains the final database enforcement layer.
