# CatCare Product Icon Assets

This folder is the CatCare product-layer icon asset package. It is not part of
`@xwlc/ui` and must not contain shared-platform icons or generic product
semantics.

- `inventory.md`: semantic icon inventory mapped to V6 prototype usage.
- `icon-spec.md`: locked SVG production rules.
- `prototype/*.png`: retained source crops or semantic PNG sources.
- `traced/*.svg`: frontend SVG assets consumed by the CatCare React wrappers.

Current accepted baseline: source PNG -> unthinned `potrace` fill SVG -> fixed
CatCare teal. Do not replace traced SVGs with hand-drawn paths unless a
prototype crop cannot provide the semantic shape or the user explicitly asks for
manual drawing.
