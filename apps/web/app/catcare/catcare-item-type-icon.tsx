import type { PlanScheduleEntry } from "./plans/plan-schedule";
import type { CatCareItemType } from "./catcare-item-types";

type IconProps = {
  className?: string;
  itemType: CatCareItemType | string;
  treatment?: "plain" | "soft";
};

type IconTone = {
  color: string;
  tint: string;
};

const itemTypeLabels: Record<string, string> = {
  dry_food: "主粮",
  litter: "猫砂",
  medicine: "药品",
  other: "其它",
  play: "互动",
  supplement: "营养补充",
  supply: "器具",
  treat: "零食",
  water: "饮水",
  wet_food: "罐头"
};

const routineIconSources: Record<string, string> = {
  dry_food: "/catcare/icons/product/routine-dry-food.png",
  litter: "/catcare/icons/product/routine-litter.png",
  play: "/catcare/icons/product/routine-play.png",
  treat: "/catcare/icons/product/routine-treat.png",
  water: "/catcare/icons/product/routine-water.png",
  wet_food: "/catcare/icons/product/routine-canned.png"
};

const itemLineIconAssets: Record<string, LineIconAsset> = {
  dry_food: {
    src: "/catcare/icons/traced/line-item-dry-food.svg",
    tint: "#e6f7f2"
  },
  litter: {
    src: "/catcare/icons/traced/line-item-litter.svg",
    tint: "#eeefff"
  },
  medicine: {
    src: "/catcare/icons/traced/line-item-medicine.svg",
    tint: "#e6f7f2"
  },
  other: {
    src: "/catcare/icons/traced/line-item-other.svg",
    tint: "#f1f4f8"
  },
  play: {
    src: "/catcare/icons/traced/line-item-play.svg",
    tint: "#fff0ed"
  },
  supplement: {
    src: "/catcare/icons/traced/line-item-supplement.svg",
    tint: "#fff4df"
  },
  supply: {
    src: "/catcare/icons/traced/line-item-supply.svg",
    tint: "#edf3ff"
  },
  treat: {
    src: "/catcare/icons/traced/line-item-treat.svg",
    tint: "#fff4df"
  },
  water: {
    src: "/catcare/icons/traced/line-item-water.svg",
    tint: "#e8f5ff"
  },
  wet_food: {
    src: "/catcare/icons/traced/line-item-wet-food.svg",
    tint: "#fff0ed"
  }
};

const taskCategoryToItemType: Record<
  NonNullable<PlanScheduleEntry["task"]["category"]>,
  keyof typeof itemTypeLabels
> = {
  environment: "supply",
  litter: "litter",
  meal: "dry_food",
  medicine: "medicine",
  observe: "other",
  other: "other",
  play: "play",
  treat: "treat",
  water: "water"
};

const eventTypeLabels: Record<string, string> = {
  behavior: "行为",
  environment: "环境",
  feeding: "喂食",
  health: "健康",
  medicine: "用药",
  other: "事件",
  travel: "出门",
  treat: "零食",
  vet: "就医"
};

const eventLineIconAssets: Record<string, LineIconAsset> = {
  behavior: {
    src: "/catcare/icons/traced/line-event-behavior.svg",
    tint: "#fff0ed"
  },
  environment: {
    src: "/catcare/icons/traced/line-event-other.svg",
    tint: "#f1f4f8"
  },
  feeding: {
    src: "/catcare/icons/traced/line-event-feeding.svg",
    tint: "#e6f7f2"
  },
  health: {
    src: "/catcare/icons/traced/line-event-health.svg",
    tint: "#fff4df"
  },
  medicine: {
    src: "/catcare/icons/traced/line-event-medicine.svg",
    tint: "#e6f7f2"
  },
  other: {
    src: "/catcare/icons/traced/line-event-other.svg",
    tint: "#f1f4f8"
  },
  travel: {
    src: "/catcare/icons/traced/line-event-travel.svg",
    tint: "#edf3ff"
  },
  treat: {
    src: "/catcare/icons/traced/line-event-treat.svg",
    tint: "#fff4df"
  },
  vet: {
    src: "/catcare/icons/traced/line-event-vet.svg",
    tint: "#edf3ff"
  }
};

const severityIconSources: Record<string, string> = {
  normal: "/catcare/icons/traced/line-severity-normal.svg",
  urgent: "/catcare/icons/traced/line-severity-urgent.svg",
  watch: "/catcare/icons/traced/line-severity-watch.svg"
};

const scenarioLineIconAssets: Record<string, LineIconAsset> = {
  business_trip: {
    src: "/catcare/icons/traced/line-scenario-business-trip.svg",
    tint: "#e6f7f2"
  },
  friend_visit: {
    src: "/catcare/icons/traced/line-scenario-friend-visit.svg",
    tint: "#fff4df"
  },
  weekend_away: {
    src: "/catcare/icons/traced/line-scenario-weekend-away.svg",
    tint: "#eeefff"
  }
};

const iconTones: Record<string, IconTone> = {
  behavior: { color: "#d85c48", tint: "#fff0ed" },
  dry_food: { color: "#07847f", tint: "#e6f7f2" },
  environment: { color: "#2f7c68", tint: "#eaf7f1" },
  feeding: { color: "#07847f", tint: "#e6f7f2" },
  health: { color: "#d74b3f", tint: "#fff0ee" },
  litter: { color: "#6264f6", tint: "#eeefff" },
  medicine: { color: "#07847f", tint: "#e6f7f2" },
  other: { color: "#526177", tint: "#f1f4f8" },
  play: { color: "#d85c48", tint: "#fff0ed" },
  supplement: { color: "#ef8a00", tint: "#fff4df" },
  supply: { color: "#3e6eaa", tint: "#edf3ff" },
  travel: { color: "#3e6eaa", tint: "#edf3ff" },
  treat: { color: "#ef8a00", tint: "#fff4df" },
  vet: { color: "#07847f", tint: "#e6f7f2" },
  water: { color: "#1687c9", tint: "#e8f5ff" },
  wet_food: { color: "#e05a45", tint: "#fff0ed" }
};

type LineIconAsset = {
  src: string;
  tint: string;
};

export function CatCareItemTypeIcon({
  className = "h-9 w-9",
  itemType,
  treatment = "plain"
}: IconProps) {
  const asset = itemLineIconAssets[itemType ?? "other"];

  if (asset) {
    return (
      <CatCareExternalIcon
        asset={asset}
        className={className}
        label={getItemTypeLabel(itemType)}
        treatment={treatment}
      />
    );
  }

  return (
    <CatCareProductGlyph
      className={className}
      label={getItemTypeLabel(itemType)}
      type={itemType ?? "other"}
    />
  );
}

export function CatCareRoutineTypeIcon({
  className = "h-16 w-16",
  itemType
}: IconProps) {
  const src = routineIconSources[itemType] ?? routineIconSources.dry_food;

  return (
    <img
      alt=""
      aria-hidden="true"
      className={`shrink-0 object-contain ${className}`}
      decoding="async"
      src={src}
      title={getItemTypeLabel(itemType)}
    />
  );
}

export function CatCareTaskCategoryIcon({
  category,
  className = "h-9 w-9",
  treatment = "plain"
}: {
  category: PlanScheduleEntry["task"]["category"];
  className?: string;
  treatment?: "plain" | "soft";
}) {
  const itemType = taskCategoryToItemType[category ?? "other"] ?? "other";
  const asset = itemLineIconAssets[itemType];

  if (asset) {
    return (
      <CatCareExternalIcon
        asset={asset}
        className={className}
        label={getItemTypeLabel(itemType)}
        treatment={treatment}
      />
    );
  }

  return (
    <CatCareProductGlyph
      className={className}
      label={getItemTypeLabel(itemType)}
      type={itemType}
    />
  );
}

export function CatCareEventTypeIcon({
  className = "h-9 w-9",
  eventType,
  treatment = "plain"
}: {
  className?: string;
  eventType: string | null;
  treatment?: "plain" | "soft";
}) {
  const asset = eventLineIconAssets[eventType ?? "other"];

  if (asset) {
    return (
      <CatCareExternalIcon
        asset={asset}
        className={className}
        label={eventTypeLabels[eventType ?? "other"] ?? eventTypeLabels.other}
        treatment={treatment}
      />
    );
  }

  return (
    <CatCareProductGlyph
      className={className}
      label={eventTypeLabels[eventType ?? "other"] ?? eventTypeLabels.other}
      type={eventType ?? "other"}
    />
  );
}

export function CatCareSeverityIcon({
  className = "h-5 w-5",
  severity
}: {
  className?: string;
  severity: string;
}) {
  const src = severityIconSources[severity] ?? severityIconSources.normal;

  return (
    <img
      alt=""
      aria-hidden="true"
      className={`shrink-0 object-contain ${className}`}
      decoding="async"
      src={src}
    />
  );
}

export function CatCareScenarioIcon({
  className = "h-8 w-8",
  scenario,
  treatment = "plain"
}: {
  className?: string;
  scenario: string;
  treatment?: "plain" | "soft";
}) {
  const asset =
    scenarioLineIconAssets[scenario] ?? scenarioLineIconAssets.weekend_away;

  return (
    <CatCareExternalIcon
      asset={asset}
      className={className}
      label="照护场景"
      treatment={treatment}
    />
  );
}

function getItemTypeLabel(itemType: string | null | undefined) {
  return itemTypeLabels[itemType ?? "other"] ?? itemTypeLabels.other;
}

function CatCareExternalIcon({
  asset,
  className,
  label,
  treatment = "soft"
}: {
  asset: LineIconAsset;
  className: string;
  label: string;
  treatment?: "plain" | "soft";
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center ${treatment === "soft" ? "rounded-full" : ""} ${className}`}
      data-catcare-product-icon=""
      style={{ backgroundColor: treatment === "soft" ? asset.tint : "transparent" }}
    >
      <img
        alt=""
        className={`${treatment === "soft" ? "h-[80%] w-[80%]" : "h-[95%] w-[95%]"} object-contain`}
        decoding="async"
        src={asset.src}
        style={{
          filter: treatment === "plain" ? "drop-shadow(0.45px 0 0 #05807b)" : undefined
        }}
        title={label}
      />
    </span>
  );
}

function CatCareProductGlyph({
  className,
  label,
  type
}: {
  className: string;
  label: string;
  type: string;
}) {
  const tone = iconTones[type] ?? iconTones.other;

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${className}`}
      data-catcare-product-icon=""
      style={{ backgroundColor: tone.tint, color: tone.color }}
    >
      <svg
        className="h-[68%] w-[68%]"
        fill="none"
        role="img"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
        viewBox="0 0 24 24"
      >
        <title>{label}</title>
        <ProductGlyphPaths type={type} />
      </svg>
    </span>
  );
}

function ProductGlyphPaths({ type }: { type: string }) {
  switch (type) {
    case "dry_food":
    case "feeding":
      return (
        <>
          <path
            d="M6.2 12.2h11.6l-.9 3.4a3.6 3.6 0 0 1-3.5 2.7h-2.8a3.6 3.6 0 0 1-3.5-2.7z"
            fill="currentColor"
            opacity="0.16"
          />
          <path d="M5.6 12.2h12.8l-.9 3.4a4 4 0 0 1-3.8 2.8h-3.4a4 4 0 0 1-3.8-2.8z" />
          <path d="M8.5 9.2c.8-.6 1.5-.6 2.2 0s1.5.6 2.2 0 1.5-.6 2.2 0" />
          <circle cx="9" cy="6.9" r=".7" fill="currentColor" stroke="none" />
          <circle cx="12" cy="6.2" r=".7" fill="currentColor" stroke="none" />
          <circle cx="15" cy="6.9" r=".7" fill="currentColor" stroke="none" />
        </>
      );
    case "wet_food":
      return (
        <>
          <path
            d="M7.4 7.4c0-1.3 2.1-2.3 4.6-2.3s4.6 1 4.6 2.3v9.2c0 1.3-2.1 2.3-4.6 2.3s-4.6-1-4.6-2.3z"
            fill="currentColor"
            opacity="0.14"
          />
          <path d="M7.4 7.4c0-1.3 2.1-2.3 4.6-2.3s4.6 1 4.6 2.3v9.2c0 1.3-2.1 2.3-4.6 2.3s-4.6-1-4.6-2.3z" />
          <path d="M7.4 7.4c0 1.3 2.1 2.3 4.6 2.3s4.6-1 4.6-2.3" />
          <path d="M10 13.2h4" />
          <path d="M10.5 6.1h3" />
        </>
      );
    case "treat":
      return (
        <>
          <path
            d="M8.2 12c1.7-2.7 4.1-4.1 7.2-4.2.6 0 1 .7.6 1.2l-1 1.5 1.2 1.5c.4.5 0 1.2-.6 1.2-3.2-.1-5.6-1.5-7.4-4.2z"
            fill="currentColor"
            opacity="0.15"
          />
          <path d="M8.1 12c1.8-2.8 4.2-4.2 7.4-4.2.6 0 1 .7.6 1.2l-1.1 1.5 1.2 1.5c.4.5 0 1.2-.6 1.2-3.2-.1-5.7-1.5-7.5-4.2z" />
          <path d="M8.1 12 5.9 9.9" />
          <path d="M8.1 12 5.9 14.1" />
          <circle cx="12.9" cy="10.6" r=".45" fill="currentColor" stroke="none" />
        </>
      );
    case "supplement":
      return (
        <>
          <path
            d="M8.5 8.4a3 3 0 0 1 4.2 0l2.9 2.9a3 3 0 0 1-4.2 4.2l-2.9-2.9a3 3 0 0 1 0-4.2z"
            fill="currentColor"
            opacity="0.14"
          />
          <path d="M8.5 8.4a3 3 0 0 1 4.2 0l2.9 2.9a3 3 0 0 1-4.2 4.2l-2.9-2.9a3 3 0 0 1 0-4.2z" />
          <path d="M8.2 15.8 15.8 8.2" />
          <path d="M17.4 5.7v2.7" />
          <path d="M16.1 7.1h2.6" />
        </>
      );
    case "medicine":
      return (
        <>
          <path d="M9 4.5h6v4H9z" />
          <path
            d="M7.5 8.5h9v11h-9z"
            fill="currentColor"
            opacity="0.13"
          />
          <path d="M7.5 8.5h9v11h-9z" />
          <path d="M12 11.2v5" />
          <path d="M9.5 13.7h5" />
        </>
      );
    case "litter":
      return (
        <>
          <path
            d="M5.5 12.4h13l-1.1 5.3H6.6z"
            fill="currentColor"
            opacity="0.14"
          />
          <path d="M5.5 12.4h13l-1.1 5.3H6.6z" />
          <path d="M7.5 9.1h9l1 3.3h-11z" />
          <path d="M9.2 15.2h5.6" />
          <path d="M15.8 6.1 18 8.3" />
        </>
      );
    case "supply":
      return (
        <>
          <path
            d="M7 8.3h10v10.2H7z"
            fill="currentColor"
            opacity="0.13"
          />
          <path d="M7 8.3h10v10.2H7z" />
          <path d="M9.5 8.3V7a2.5 2.5 0 0 1 5 0v1.3" />
          <path d="M9.2 12.2h5.6" />
          <path d="M10 15.1h4" />
          <path d="M14.8 4.4 17 6.6" />
        </>
      );
    case "water":
      return (
        <>
          <path
            d="M12 4.5c2.9 3.4 4.4 5.9 4.4 8a4.4 4.4 0 0 1-8.8 0c0-2.1 1.5-4.6 4.4-8z"
            fill="currentColor"
            opacity="0.14"
          />
          <path d="M12 4.5c2.9 3.4 4.4 5.9 4.4 8a4.4 4.4 0 0 1-8.8 0c0-2.1 1.5-4.6 4.4-8z" />
          <path d="M10.2 13.4a2 2 0 0 0 2 1.7" />
        </>
      );
    case "play":
    case "behavior":
      return (
        <>
          <path d="M6.2 16.5c2.2-4.4 5.4-6.6 9.5-6.6" />
          <path
            d="M15.7 9.9c1.4.1 2.4 1 2.7 2.2.3 1.1-.1 2.4-1.1 3.1"
            fill="currentColor"
            opacity="0.14"
          />
          <path d="M15.7 9.9c1.4.1 2.4 1 2.7 2.2.3 1.1-.1 2.4-1.1 3.1" />
          <path d="M8.8 16.5h5.6" />
          <circle cx="6.1" cy="16.5" r="1.4" fill="currentColor" opacity="0.16" />
          <circle cx="6.1" cy="16.5" r="1.4" />
        </>
      );
    case "health":
      return (
        <>
          <path
            d="M12 19s-6.5-3.8-6.5-8.6A3.5 3.5 0 0 1 12 8.6a3.5 3.5 0 0 1 6.5 1.8C18.5 15.2 12 19 12 19z"
            fill="currentColor"
            opacity="0.13"
          />
          <path d="M12 19s-6.5-3.8-6.5-8.6A3.5 3.5 0 0 1 12 8.6a3.5 3.5 0 0 1 6.5 1.8C18.5 15.2 12 19 12 19z" />
          <path d="M8.3 12.5h2.2l1-2.2 1.4 4 1-1.8h1.8" />
        </>
      );
    case "vet":
      return (
        <>
          <path d="M8 5.5v5a4 4 0 0 0 8 0v-5" />
          <path d="M8 5.5H6.8" />
          <path d="M16 5.5h1.2" />
          <path d="M12 14.5v1.2a3.3 3.3 0 0 0 3.3 3.3" />
          <path d="M17.5 19a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z" />
        </>
      );
    case "travel":
      return (
        <>
          <path
            d="M5.5 8h13v10.5h-13z"
            fill="currentColor"
            opacity="0.13"
          />
          <path d="M8 8V6.8A2.3 2.3 0 0 1 10.3 4.5h3.4A2.3 2.3 0 0 1 16 6.8V8" />
          <path d="M5.5 8h13v10.5h-13z" />
          <path d="M8.8 12.2c.6-.8 1.4-1.2 2.4-1.2h1.6c1 0 1.8.4 2.4 1.2" />
          <circle cx="9.2" cy="15.2" r=".55" fill="currentColor" stroke="none" />
          <circle cx="14.8" cy="15.2" r=".55" fill="currentColor" stroke="none" />
        </>
      );
    case "environment":
      return (
        <>
          <path
            d="M7.5 11v7.5h9V11L12 6.5z"
            fill="currentColor"
            opacity="0.13"
          />
          <path d="M5.5 12.5 12 6l6.5 6.5" />
          <path d="M7.5 11v7.5h9V11" />
          <path d="M10 18.5v-4h4v4" />
        </>
      );
    default:
      return (
        <>
          <path d="M7.5 12h.1" />
          <path d="M12 12h.1" />
          <path d="M16.5 12h.1" />
        </>
      );
  }
}
