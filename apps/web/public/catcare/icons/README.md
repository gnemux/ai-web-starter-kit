# CatCare Product Icon Assets

This folder is the CatCare product-layer icon asset package. It is not part of
`@xwlc/ui` and must not contain shared-platform icons or generic product
semantics.

- `inventory.md`: semantic icon inventory mapped to V6 prototype usage.
- `icon-spec.md`: locked SVG production rules.
- `prototype/*.png`: retained source crops or semantic PNG sources.
- `product/*.png`: runtime product icons derived from prototype crops when the
  prototype's color and light illustration treatment are part of the intended
  UI quality.
- `traced/*.svg`: frontend SVG assets consumed by the CatCare React wrappers.

Current accepted baseline for product/navigation/flow symbols: source PNG ->
unthinned `potrace` fill SVG -> fixed CatCare teal. Product-category routine
icons are an exception: keep the prototype color/tint treatment by using
runtime PNGs under `product/`. Temporary-care scenario icons also render from
`product/` crops because they are entry illustrations, not shared navigation
glyphs. Food/item category and event-category icons use an
imagegen line-icon source sheet under `prototype/`, then traced SVG outputs
under `traced/`. Concrete item rows use the same category icon family instead
of separate product thumbnails, so the list stays scannable and does not depend
on fragile generated product art. Do not replace prototype/imagegen-derived
assets with hand-drawn paths unless a source cannot provide the semantic shape
or the user explicitly asks for manual drawing.
