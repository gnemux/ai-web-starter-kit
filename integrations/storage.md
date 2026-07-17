# Storage Integration

## Purpose

Storage integration will support product file uploads, generated assets, exports, or private documents when a product task needs them.

## Status

The generic provider slot remains reserved, but CatCare now has two explicit
product-local Supabase Storage workflows: private owner cat photos and private
care-submission evidence. This does not claim a generic Storage adapter or a
template-wide media platform.

The provider boundary and stage split are defined in `integrations/provider-matrix.md`.

GNE-181 defines provider-neutral Storage contract types in `packages/core/src/providers.ts` and a no-op adapter landing point in `apps/web/lib/providers/server.ts`.

## Strategy

Start with a no-op or mock storage adapter until a product workflow requires files. Candidate providers should be chosen after access rules, privacy requirements, public/private bucket behavior, and CDN needs are clear.

## MVP Boundaries

- MVP2 defines provider matrix, env naming, server-only secret rules, and no-op/mock behavior.
- MVP3 may consume a mock or later provider-backed storage path for Product Validation Kit workflows.
- MVP4 owns overseas/china real storage/CDN rollout, including object storage, public asset delivery, private access, and compliance/deployment differences.

## Environment Variables

```text
STORAGE_PROVIDER=noop
STORAGE_ENDPOINT=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY_ID=
STORAGE_SECRET_ACCESS_KEY=
```

`STORAGE_PROVIDER` is a non-secret server-side selector. Storage access and signing credentials are server-only placeholders and must not use `NEXT_PUBLIC_`.

## Rules

- Do not commit storage service keys, signing secrets, bucket credentials, private files, or customer uploads.
- Signed URL creation must stay server-side.
- Product code should call a local storage service/provider adapter instead of importing a provider SDK in pages or components.
- Vercel Production and Preview entries must be configured separately. Redeploy after changing Storage env keys before verifying upload or signed URL behavior.
- CatCare care evidence uses a private `care-evidence` bucket with no direct
  browser policy. Share-token uploads and owner downloads pass through
  server-side product authorization; no public or signed object URL is exposed.
- Supabase Free image transformation is not assumed. The application decodes
  and re-encodes uploaded images with Sharp to remove metadata and bound size.
- Care-evidence phone originals are first reduced in the browser from at most
  15 MB to a network-safe WebP no larger than 3 MB. This is only a transport
  optimization; the server repeats decode, format, dimension, byte-size, and
  metadata enforcement before writing the private bucket.
