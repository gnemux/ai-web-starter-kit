# Storage Integration

## Purpose

Storage integration will support product file uploads, generated assets, exports, or private documents when a product task needs them.

## Status

Reserved for future MVP2/MVP3 execution. No real storage provider is configured for product file workflows today.

The provider boundary and stage split are defined in `integrations/provider-matrix.md`.

GNE-181 defines provider-neutral Storage contract types in `packages/core/src/providers.ts` and a no-op adapter landing point in `apps/web/lib/providers/server.ts`.

## Strategy

Start with a no-op or mock storage adapter until a product workflow requires files. Candidate providers should be chosen after access rules, privacy requirements, public/private bucket behavior, and CDN needs are clear.

## MVP Boundaries

- MVP2 defines provider matrix, env naming, server-only secret rules, and no-op/mock behavior.
- MVP3 may consume a mock or later provider-backed storage path for Product Validation Kit workflows.
- MVP4 owns overseas/china real storage/CDN rollout, including object storage, public asset delivery, private access, and compliance/deployment differences.

## Environment Variables

Names will be finalized by `GNE-182`. Until then, storage secrets are server-only placeholders and must not use `NEXT_PUBLIC_`.

## Rules

- Do not commit storage service keys, signing secrets, bucket credentials, private files, or customer uploads.
- Signed URL creation must stay server-side.
- Product code should call a local storage service/provider adapter instead of importing a provider SDK in pages or components.
