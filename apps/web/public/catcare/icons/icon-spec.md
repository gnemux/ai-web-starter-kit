# CatCare Icon Spec

Scope: CatCare product UI only.

## Source PNG Rules

- Source: crop from `specs/reference-product/prototypes/v6-regenerated-normalized/`.
- Location: `apps/web/public/catcare/icons/prototype/`.
- Naming: semantic kebab-case file names, for example `cat-profile.png`.
- Canvas: transparent `96x96` PNG, centered icon body.
- Color: normalized to CatCare teal from the original prototype icon shape.
- Usage: source images for traced SVG assets.

## Traced SVG Rules

- Source: generated from `prototype/*.png` with `potrace` fill tracing, then
  manually repaired only when the prototype crop included selected-state, badge,
  clipped, or non-icon artifacts.
- Required process:
  1. Crop the semantic icon from `v6-regenerated-normalized/`.
  2. Normalize the crop into `prototype/<semantic-name>.png`.
  3. Run unthinned bitmap tracing into `traced/<semantic-name>.svg`.
  4. Only when the prototype cannot provide a separable source, create a
     semantic source PNG first, then run the same tracing step.
- Do not directly hand-draw final frontend SVGs unless the user explicitly asks
  for a direct manual SVG.
- Location: `apps/web/public/catcare/icons/traced/`.
- Usage: GNE-280 visual baseline for Landing, Login, Dashboard, and Billing.
- Canvas: `viewBox="0 0 24 24"`.
- Naming: semantic kebab-case file names, for example `cat-profile.svg`.
- ID: `catcare-<file-name-without-extension>`.
- Color: fixed CatCare teal because the assets are loaded as external images.
- Palette: active, inactive, hover, and disabled states belong to the wrapper;
  the icon body remains teal for this UI baseline.
- Weight: the accepted GNE-280 baseline is the unthinned `potrace` fill output.
  Do not run global thinning by default; use it only for a targeted comparison.
- Layers: generated fill paths are acceptable for prototype-derived icons;
  manually authored repairs must stay simple and semantic.
- Output: plain SVG, no embedded raster image, no filters, no CSS classes.

## Current Command Shape

Use the existing local tools; do not introduce a new tracing dependency unless
the current output demonstrably fails review.

```text
magick prototype/<name>.png -background white -alpha remove -alpha off \
  -colorspace Gray -threshold 80% /tmp/<name>.pbm
potrace /tmp/<name>.pbm -s -o traced/<name>.svg
```

Then normalize the SVG header to `width="24" height="24" viewBox="0 0 24 24"`,
set the generated group fill to `#05807b`, and remove metadata. The accepted
baseline is the non-thinned result.

## Frontend Contract

- React components in `apps/web/components/catcare-icons.tsx` wrap the traced
  SVG assets first.
- Active, inactive, hover, and disabled states are controlled by CSS around the
  wrapper; icon body color is fixed to CatCare teal for consistency.
- Shared package components must not import CatCare icon files.

## Design Handoff

If Figma becomes the source of truth, export SVGs into this folder with the same
file names and IDs. Do not rename frontend components unless the product
semantics change.
