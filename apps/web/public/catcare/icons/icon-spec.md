# CatCare Icon Spec

Scope: CatCare product UI only.

## Asset Ownership

Common capability assets:

- `packages/ui` components own product-agnostic surfaces such as `Button`,
  `Badge`, `EmptyState`, `ErrorState`, shell primitives, and layout utilities.
- Generic app icons in `apps/web/components/app-icons.tsx` are shared web-app
  UI symbols such as home, account, billing, notification, and chevrons.
- Common assets must not import files from `apps/web/public/catcare/**`.

CatCare product assets:

- Prototype-derived icons live under `apps/web/public/catcare/icons/**` and are
  owned by the CatCare product UI.
- Product-category runtime icons live under
  `apps/web/public/catcare/icons/product/` when the prototype's colored
  illustration treatment is the product-quality baseline.
- Temporary-care scenario runtime icons live under
  `apps/web/public/catcare/icons/traced/` as `line-scenario-*` SVGs; matching
  source crops may remain in `prototype/`, but frontend code must not consume
  `prototype/` directly.
- Cat illustrations live under `apps/web/public/catcare/cats/**` and are
  CatCare-specific breed/profile assets.
- CatCare action icons live in
  `apps/web/app/catcare/catcare-action-icons.tsx`; they are local product
  primitives because their color, stroke, and sizing are tuned to this product.
- CatCare owner-flow components in `apps/web/app/catcare/owner-flow-components.tsx`
  are app/product-layer components. Move them to `packages/*` only after another
  product reuses the same behavior and visual contract.

Do not place CatCare business objects, breed dictionaries, cat illustrations,
or CatCare-only icon assets in `packages/*`.

## Source PNG Rules

- Source: crop from `specs/reference-product/prototypes/v6-regenerated-normalized/`.
- Location: `apps/web/public/catcare/icons/prototype/`.
- Naming: semantic kebab-case file names, for example `cat-profile.png`.
- Canvas: transparent `96x96` PNG, centered icon body.
- Color: normalized to CatCare teal from the original prototype icon shape.
- Usage: source images for traced SVG assets.
- Exception: routine product-category icons may be converted into transparent
  runtime PNGs when preserving the prototype's colored badge treatment is the
  stronger visual match than a one-color trace.
- Exception: food/item category and event-category icons that are not covered by
  the normalized prototypes may use an imagegen line-icon source sheet first.
  Keep the generated sheet in `prototype/`, crop each semantic PNG, then trace
  into SVG with the same naming contract.
- Deprecated exception: concrete item thumbnails under
  `apps/web/public/catcare/items/` are not part of the current UI contract.
  Food and supplies rows use the category icon family instead, because generated
  product art made the inventory list harder to scan.

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
- Product/navigation/flow icons use traced assets. Functional action icons
  inside buttons, inputs, and dialogs use the local currentColor line icon set
  in `apps/web/app/catcare/catcare-action-icons.tsx` so weight, alignment, and
  foreground color stay consistent at small sizes.
- Routine product icons use transparent prototype-derived PNG assets through
  `CatCareRoutineTypeIcon`. They must not be replaced by hand-drawn inline SVG
  glyphs just to fit the generic stroke icon system.
- Food/item category icons use `CatCareItemTypeIcon` and traced `line-item-*`
  SVGs.
- Event category icons use `CatCareEventTypeIcon` and traced `line-event-*`
  SVGs. Legacy `environment` rows may render through the `other` visual asset,
  but new event creation should not expose an environment category unless the
  product spec reintroduces it.
- Concrete item rows use `CatCareItemTypeIcon`. Do not add per-item generated
  thumbnails unless the product design has a reviewed source library.
- Severity controls use `CatCareSeverityIcon` and traced `line-severity-*`
  SVGs.
- Temporary care-plan scenario cards use `CatCareScenarioIcon` and traced
  `line-scenario-*` SVGs. The page owns the circular backing and color state;
  the icon component must not hand-draw inline SVG paths or load the product
  PNG directly. Generate these SVGs by thresholding the prototype-derived
  scenario PNG to remove the pale circular backing, then run `potrace`.

## UI Size Contract

| UI surface | Control size | Icon size | Notes |
| --- | ---: | ---: | --- |
| Primary/secondary/ghost/danger action button | 56px height | 20px | Used by `CatCareButton` and `CatCareActionButton`. |
| Small pill action | 40px min height | 16px | Used for compact photo/upload actions. |
| Mobile shell nav button | 44px min height | 20px | Icon and label sit in a compact row. |
| Sidebar icon frame | 44-56px frame | 28px | Frame controls active state; icon body stays teal. |
| Metric/flow illustration icon | display block | 32-40px | Larger communicative icons only, not form actions. |
| Food/item category navigation | 48-56px row | 36px | Icon uses no separate circular backing; the selected item owns the frame. |
| Concrete item row | list row | 40px | Reuse category icon; no generated product thumbnail. |
| Event type selector | 44px row | 28px | Button owns the border; icon should not add a second card frame. |
| Timeline event node | 48px status node | 28-32px | The node itself carries severity color; do not add a separate white icon card/frame. |
| Care-plan scenario card | card header icon shell | 32px inside 56px shell | Icon source is traced SVG; card owns selected state and shell color. |

Action icons must share the same visual weight at the rendered size. Do not mix
traced product icons with functional button icons in the same action group.
Do not wrap every product icon in an additional card or border. Category icons,
item-row icons, and timeline nodes have separate display contracts.

## Design Handoff

If Figma becomes the source of truth, export SVGs into this folder with the same
file names and IDs. Do not rename frontend components unless the product
semantics change.
