# CatCare Icon Inventory

Source reference: `specs/reference-product/prototypes/v6-regenerated-normalized/`.

Current frontend source: `apps/web/public/catcare/icons/traced/`.
Prototype crops are retained in `apps/web/public/catcare/icons/prototype/` as
trace sources.

| Traced SVG | Semantic wrappers | Primary usage | Prototype reference |
| --- | --- | --- | --- |
| `traced/dashboard.svg` | `CatCareDashboardIcon` | sidebar dashboard, fallback flow icon | repaired from `03-onboarding-dashboard.png` selected state |
| `traced/cat-profile.svg` | `CatCareProfileIcon`, `CatCareCatCountIcon` | cat profile step, metric, sidebar, cats metric | user-provided crop from `03-onboarding-dashboard.png` sidebar |
| `traced/feeding-routine.svg` | `CatCareRoutineIcon`, `CatCareFeedingRoutineIcon` | recurring feeding routine step, dashboard onboarding | `03-onboarding-dashboard.png` |
| `traced/pet-supplies.svg` | `CatCareFoodIcon`, `CatCarePetSuppliesIcon` | food/item setup sidebar and future item pages | `03-onboarding-dashboard.png` |
| `traced/care-events.svg` | `CatCareEventIcon`, `CatCareCareEventsIcon` | events timeline, dashboard onboarding | `03-onboarding-dashboard.png` |
| `traced/ai-checklist.svg` | `CatCareChecklistIcon`, `CatCareCarePlanIcon`, `CatCareAiChecklistIcon` | care plan and AI checklist | `03-onboarding-dashboard.png` |
| `traced/care-plan-metric.svg` | `CatCareCarePlanMetricIcon` | care plans metric card | `03-onboarding-dashboard.png` metric card |
| `traced/share-link.svg` | `CatCareShareIcon`, `CatCareShareLinkIcon` | private share link step | `03-onboarding-dashboard.png` |
| `traced/sitter-complete.svg` | `CatCareSitterIcon` | sitter completion step | `01-landing.png` |
| `traced/results-review.svg` | `CatCareOwnerReviewIcon`, `CatCareResultsReviewIcon` | owner results review step | `01-landing.png` |
| `traced/ai-review.svg` | `CatCareAiIcon` | AI review and AI analysis | `01-landing.png` |
| `traced/billing-entitlements.svg` | `CatCareBillingIcon`, `CatCareBillingEntitlementsIcon` | Billing & Entitlements, sandbox notice | `13-billing-entitlements.png` |
| `traced/ai-credit.svg` | `CatCareUsageIcon`, `CatCareAiCreditIcon` | AI Credit usage and metric card | `03-onboarding-dashboard.png` metric card |
| `traced/bell.svg` | `CatCareBellIcon` | product shell notifications | repaired from `03-onboarding-dashboard.png` bell crop |
| `traced/pending.svg` | `CatCarePendingIcon` | pending submissions metric | `03-onboarding-dashboard.png` metric card |
| `traced/add-cat.svg` | `CatCareAddCatIcon` | Add cat CTA icon | semantic source based on `03-onboarding-dashboard.png` CTA |
| `traced/credit-pack-5.svg` | `CatCareCreditPack5Icon` | 5 USD credit pack tile | `13-billing-entitlements.png` credit pack tile |
| `traced/credit-pack-15.svg` | `CatCareCreditPack15Icon` | 12 USD credit pack tile | `13-billing-entitlements.png` credit pack tile |
| `traced/credit-pack-30.svg` | `CatCareCreditPack30Icon` | 29 USD credit pack tile | `13-billing-entitlements.png` credit pack tile |
| `traced/credit-pack-100.svg` | `CatCareCreditPack100Icon` | 59 USD credit pack tile | `13-billing-entitlements.png` credit pack tile |

Missing final design source: no Figma SVG export is present in the repository.
The old hand-drawn cat face SVGs were removed because they did not match the
approved prototype direction. The cat profile/count icons now share one traced
SVG generated from the approved sidebar cat-profile crop.

2026-07-02 GNE-280 decision: the accepted in-page icon weight is the unthinned
prototype PNG -> `potrace` fill SVG output. The thinner morphology variant was
tested and rejected for the current UI baseline because it reduced the product
icon presence too much.
