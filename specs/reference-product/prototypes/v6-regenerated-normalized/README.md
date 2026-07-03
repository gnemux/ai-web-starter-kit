# CatCare V6 Regenerated Split Prototypes

This folder contains the regenerated GNE-278 V6 split prototype screens.

- Count: 13 screens.
- Size: `1536x1024` each.
- Source process: regenerated as separate high-fidelity UI mockups from the GNE-278/V6 product specification, then normalized to a consistent canvas.
- Intended use: visual reference for GNE-280 high-fidelity CatCare UI implementation.

Use this folder as the visual comparison source for GNE-280 implementation.

## Screens

- `01-landing.png`
- `02-login-register.png`
- `03-onboarding-dashboard.png`
- `04-cat-profile.png`
- `05-recurring-routine.png`
- `06-food-care-items.png`
- `07-event-health-timeline.png`
- `08-scenario-ai-inputs.png`
- `09-ai-generate-review.png`
- `10-private-share.png`
- `11-sitter-checklist.png`
- `12-results-ai-review-billing.png`
- `13-billing-entitlements.png`

## Notes

The regenerated images restore product feel and page-level hierarchy better than the deterministic SVG rebuild. Text, prices, routes, and button states must still be checked against `specs/reference-product/gne-278-product-flow.md` during implementation, because bitmap generation can slightly distort text.
