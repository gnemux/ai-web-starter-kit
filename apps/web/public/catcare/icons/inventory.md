# CatCare Icon Inventory

Source reference: `specs/reference-product/prototypes/v6-regenerated-normalized/`.

Current frontend source: `apps/web/public/catcare/icons/traced/`.
Prototype crops are retained in `apps/web/public/catcare/icons/prototype/` as
trace sources.

2026-07-07 GNE-290 correction: product-category routine icons must preserve the
prototype's colored light-illustration treatment. Raw prototype crops carried
baked-in white backing, so runtime product icons live as transparent PNGs under
`product/`. `CatCareRoutineTypeIcon` must use those assets for dry food, canned
food, treats, water, litter, and play.

2026-07-07 line icon correction: food/item category, event category, and
severity icons use `prototype/catcare-line-icons-sheet.png` as the imagegen
source sheet. The semantic crops live as `prototype/line-*.png`; runtime UI
loads the corresponding `traced/line-*.svg` assets through
`CatCareItemTypeIcon`, `CatCareEventTypeIcon`, `CatCareSeverityIcon`, and
`CatCareScenarioIcon`.

2026-07-08 item list correction: concrete food and supplies rows no longer use
generated product thumbnails. Rows use `CatCareItemTypeIcon` so the inventory
list stays consistent with category navigation and private-share task icons.

2026-07-08 scenario correction: care-plan scenario cards use traced
`line-scenario-*` SVG assets for business trip, weekend away, and friend visit.
These SVGs are generated from prototype-derived product scenario PNGs after
removing the pale backing with a grayscale threshold, then running `potrace`.
Runtime cards own the circular backing and selected state; frontend code must
not hand-draw scenario paths inline or load the product PNG directly.

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
| `traced/arrow-left.svg` | `CatCareArrowLeftIcon` | owner flow back actions | semantic source PNG, then potrace |
| `traced/calendar.svg` | `CatCareCalendarIcon` | date controls | semantic source PNG, then potrace |
| `traced/chevron-down.svg` | `CatCareChevronDownIcon` | select and autocomplete controls | semantic source PNG, then potrace |
| `traced/edit.svg` | `CatCareEditIcon` | edit actions | semantic source PNG, then potrace |
| `traced/save.svg` | `CatCareSaveIcon` | save draft actions | semantic source PNG, then potrace |
| `traced/search.svg` | `CatCareSearchIcon` | autocomplete controls | semantic source PNG, then potrace |
| `traced/trash.svg` | `CatCareTrashIcon` | destructive owner actions | semantic source PNG, then potrace |
| `traced/upload.svg` | `CatCareUploadIcon` | photo upload actions | semantic source PNG, then potrace |

| CatCare product asset | Semantic wrappers | Primary usage | Source |
| --- | --- | --- | --- |
| `product/routine-dry-food.png` | `CatCareRoutineTypeIcon` | prototype 05 feeding habits, dry food routine card | prototype routine crop, transparent PNG |
| `product/routine-canned.png` | `CatCareRoutineTypeIcon` | prototype 05 feeding habits, wet food routine card | prototype routine crop, transparent PNG |
| `product/routine-treat.png` | `CatCareRoutineTypeIcon` | prototype 05 feeding habits, treat routine card | prototype routine crop, transparent PNG |
| `product/routine-water.png` | `CatCareRoutineTypeIcon` | prototype 05 feeding habits, water routine card | prototype routine crop, transparent PNG |
| `product/routine-litter.png` | `CatCareRoutineTypeIcon` | prototype 05 feeding habits, litter routine card | prototype routine crop, transparent PNG |
| `product/routine-play.png` | `CatCareRoutineTypeIcon` | prototype 05 feeding habits, play routine card | prototype routine crop, transparent PNG |
| `traced/line-item-dry-food.svg` | `CatCareItemTypeIcon` | food/item category tab and add-item summary | imagegen line sheet crop, potrace |
| `traced/line-item-wet-food.svg` | `CatCareItemTypeIcon` | food/item category tab and add-item summary | imagegen line sheet crop, potrace |
| `traced/line-item-treat.svg` | `CatCareItemTypeIcon` | food/item category tab and add-item summary | imagegen line sheet crop, potrace |
| `traced/line-item-supplement.svg` | `CatCareItemTypeIcon` | food/item category tab and add-item summary | imagegen line sheet crop, potrace |
| `traced/line-item-medicine.svg` | `CatCareItemTypeIcon` | food/item category tab and add-item summary | imagegen line sheet crop, potrace |
| `traced/line-item-water.svg` | `CatCareItemTypeIcon` | private-share water task and task category icon | imagegen line sheet crop, potrace-style repair |
| `traced/line-item-play.svg` | `CatCareItemTypeIcon` | private-share play task and task category icon | imagegen line sheet crop, potrace-style repair |
| `traced/line-item-litter.svg` | `CatCareItemTypeIcon` | food/item category tab and add-item summary | imagegen line sheet crop, potrace |
| `traced/line-item-supply.svg` | `CatCareItemTypeIcon` | food/item category tab and add-item summary | imagegen line sheet crop, potrace |
| `traced/line-item-other.svg` | `CatCareItemTypeIcon` | food/item category tab and add-item summary | imagegen line sheet crop, potrace |
| `traced/line-event-feeding.svg` | `CatCareEventTypeIcon` | event type selector and timeline | imagegen line sheet crop, potrace |
| `traced/line-event-treat.svg` | `CatCareEventTypeIcon` | event type selector and timeline | imagegen line sheet crop, potrace |
| `traced/line-event-health.svg` | `CatCareEventTypeIcon` | event type selector and timeline | imagegen line sheet crop, potrace |
| `traced/line-event-medicine.svg` | `CatCareEventTypeIcon` | event type selector and timeline | imagegen line sheet crop, potrace |
| `traced/line-event-vet.svg` | `CatCareEventTypeIcon` | event type selector and timeline | imagegen line sheet crop, potrace |
| `traced/line-event-travel.svg` | `CatCareEventTypeIcon` | event type selector and timeline | imagegen line sheet crop, potrace |
| `traced/line-event-behavior.svg` | `CatCareEventTypeIcon` | event type selector and timeline | imagegen line sheet crop, potrace |
| `traced/line-event-other.svg` | `CatCareEventTypeIcon` | event type selector, timeline, legacy environment fallback | imagegen line sheet crop, potrace |
| `traced/line-severity-normal.svg` | `CatCareSeverityIcon` | event severity controls and timeline badge | imagegen line sheet crop, potrace |
| `traced/line-severity-watch.svg` | `CatCareSeverityIcon` | event severity controls and timeline badge | imagegen line sheet crop, potrace |
| `traced/line-severity-urgent.svg` | `CatCareSeverityIcon` | event severity controls and timeline badge | imagegen line sheet crop, potrace |
| `traced/line-scenario-business-trip.svg` | `CatCareScenarioIcon` | care-plan business trip card | product scenario PNG, grayscale threshold, potrace |
| `traced/line-scenario-weekend-away.svg` | `CatCareScenarioIcon` | care-plan weekend away card | product scenario PNG, grayscale threshold, potrace |
| `traced/line-scenario-friend-visit.svg` | `CatCareScenarioIcon` | care-plan friend visit card | product scenario PNG, grayscale threshold, potrace |

Missing final design source: no Figma SVG export is present in the repository.
The old hand-drawn cat face SVGs were removed because they did not match the
approved prototype direction. The cat profile/count icons now share one traced
SVG generated from the approved sidebar cat-profile crop.

2026-07-02 GNE-280 decision: the accepted in-page icon weight is the unthinned
prototype PNG -> `potrace` fill SVG output. The thinner morphology variant was
tested and rejected for the current UI baseline because it reduced the product
icon presence too much.
