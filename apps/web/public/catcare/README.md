# CatCare Product Assets

These assets belong to the CatCare product layer, not `@xwlc/ui`.

## Prototype-To-Asset Rules

- Use `specs/reference-product/prototypes/v6-regenerated-normalized/` as visual
  reference, but do not wire whole-page crops directly into final UI when they
  include text, card borders, selected-state fills, or clipped illustration
  edges.
- Normalize card illustrations into same-size product assets before use. Current
  pricing card cats use `320x240` canvases with a shared warm background.
- For icons, follow `icons/icon-spec.md`: crop source, normalize, trace/repair,
  then consume through `apps/web/components/catcare-icons.tsx`.
- `illustrations/ai-review-robot-cat.png` is a result-review raster
  illustration, not part of the traced SVG product icon system.
- Keep CatCare-specific cats, pricing art, and product iconography here. Move
  only product-agnostic UI primitives to shared packages.
