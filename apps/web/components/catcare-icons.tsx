type IconProps = {
  className?: string;
};

const iconAssetIds = {
  addCat: "add-cat",
  aiReview: "ai-review",
  bell: "bell",
  billing: "billing-entitlements",
  catCount: "cat-profile",
  checklist: "ai-checklist",
  carePlanMetric: "care-plan-metric",
  creditPack: "credit-pack",
  creditPack100: "credit-pack-100",
  creditPack15: "credit-pack-15",
  creditPack30: "credit-pack-30",
  creditPack5: "credit-pack-5",
  dashboard: "dashboard",
  events: "care-events",
  foodItems: "pet-supplies",
  pending: "pending",
  profile: "cat-profile",
  results: "results-review",
  routine: "feeding-routine",
  share: "share-link",
  sitter: "sitter-complete",
  usage: "ai-credit"
} as const;

function CatCareTracedIcon({
  className = "h-5 w-5",
  name
}: IconProps & { name: keyof typeof iconAssetIds }) {
  const fileName = iconAssetIds[name];
  const src = fileName.includes("/")
    ? `/catcare/icons/${fileName}`
    : `/catcare/icons/traced/${fileName}.svg`;

  return (
    <img
      alt=""
      aria-hidden="true"
      className={className}
      decoding="async"
      src={src}
    />
  );
}

export function CatCareDashboardIcon(props: IconProps) {
  return <CatCareTracedIcon name="dashboard" {...props} />;
}

export function CatCareProfileIcon(props: IconProps) {
  return <CatCareTracedIcon name="profile" {...props} />;
}

export function CatCareCatCountIcon(props: IconProps) {
  return <CatCareProfileIcon {...props} />;
}

export function CatCareAddCatIcon(props: IconProps) {
  return <CatCareTracedIcon name="addCat" {...props} />;
}

export function CatCareRoutineIcon(props: IconProps) {
  return <CatCareTracedIcon name="routine" {...props} />;
}

export function CatCareFeedingRoutineIcon(props: IconProps) {
  return <CatCareRoutineIcon {...props} />;
}

export function CatCareFoodIcon(props: IconProps) {
  return <CatCareTracedIcon name="foodItems" {...props} />;
}

export function CatCarePetSuppliesIcon(props: IconProps) {
  return <CatCareFoodIcon {...props} />;
}

export function CatCareEventIcon(props: IconProps) {
  return <CatCareTracedIcon name="events" {...props} />;
}

export function CatCareCareEventsIcon(props: IconProps) {
  return <CatCareEventIcon {...props} />;
}

export function CatCareChecklistIcon(props: IconProps) {
  return <CatCareTracedIcon name="checklist" {...props} />;
}

export function CatCareCarePlanIcon(props: IconProps) {
  return <CatCareChecklistIcon {...props} />;
}

export function CatCareCarePlanMetricIcon(props: IconProps) {
  return <CatCareTracedIcon name="carePlanMetric" {...props} />;
}

export function CatCareShareIcon(props: IconProps) {
  return <CatCareTracedIcon name="share" {...props} />;
}

export function CatCareShareLinkIcon(props: IconProps) {
  return <CatCareShareIcon {...props} />;
}

export function CatCareSitterIcon(props: IconProps) {
  return <CatCareTracedIcon name="sitter" {...props} />;
}

export function CatCareOwnerReviewIcon(props: IconProps) {
  return <CatCareTracedIcon name="results" {...props} />;
}

export function CatCareResultsReviewIcon(props: IconProps) {
  return <CatCareOwnerReviewIcon {...props} />;
}

export function CatCareAiIcon(props: IconProps) {
  return <CatCareTracedIcon name="aiReview" {...props} />;
}

export function CatCareAiChecklistIcon(props: IconProps) {
  return <CatCareChecklistIcon {...props} />;
}

export function CatCareBillingIcon(props: IconProps) {
  return <CatCareTracedIcon name="billing" {...props} />;
}

export function CatCareBillingEntitlementsIcon(props: IconProps) {
  return <CatCareBillingIcon {...props} />;
}

export function CatCareUsageIcon(props: IconProps) {
  return <CatCareTracedIcon name="usage" {...props} />;
}

export function CatCareAiCreditIcon(props: IconProps) {
  return <CatCareUsageIcon {...props} />;
}

export function CatCareBellIcon(props: IconProps) {
  return <CatCareTracedIcon name="bell" {...props} />;
}

export function CatCarePendingIcon(props: IconProps) {
  return <CatCareTracedIcon name="pending" {...props} />;
}

export function CatCareCreditPackIcon(props: IconProps) {
  return <CatCareTracedIcon name="creditPack" {...props} />;
}

export function CatCareCreditPack5Icon(props: IconProps) {
  return <CatCareTracedIcon name="creditPack5" {...props} />;
}

export function CatCareCreditPack15Icon(props: IconProps) {
  return <CatCareTracedIcon name="creditPack15" {...props} />;
}

export function CatCareCreditPack30Icon(props: IconProps) {
  return <CatCareTracedIcon name="creditPack30" {...props} />;
}

export function CatCareCreditPack100Icon(props: IconProps) {
  return <CatCareTracedIcon name="creditPack100" {...props} />;
}
