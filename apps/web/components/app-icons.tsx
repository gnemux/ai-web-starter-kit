type IconProps = {
  className?: string;
};

const iconProps = {
  "aria-hidden": true,
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: 1.8,
  viewBox: "0 0 24 24"
} as const;

export function OverviewIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...iconProps}>
      <path d="M4 5.5h7v7H4z" />
      <path d="M13 5.5h7v4h-7z" />
      <path d="M13 11.5h7v7h-7z" />
      <path d="M4 14.5h7v4H4z" />
    </svg>
  );
}

export function DashboardIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...iconProps}>
      <path d="M4 13.5a8 8 0 1 1 16 0" />
      <path d="M12 13.5l4-4" />
      <path d="M6.5 17.5h11" />
    </svg>
  );
}

export function HomeIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...iconProps}>
      <path d="M4.5 11.2 12 5l7.5 6.2" />
      <path d="M6.5 10.8v7.4c0 .9.7 1.6 1.6 1.6h7.8c.9 0 1.6-.7 1.6-1.6v-7.4" />
      <path d="M10 19.8v-4.2c0-1.1.9-2 2-2s2 .9 2 2v4.2" />
    </svg>
  );
}

export function SpecsIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...iconProps}>
      <path d="M7 4.5h7l3 3v12H7z" />
      <path d="M14 4.5v4h4" />
      <path d="M10 12h5" />
      <path d="M10 15h5" />
    </svg>
  );
}

export function IntegrationsIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...iconProps}>
      <path d="M8 8h8v8H8z" />
      <path d="M4 12h4" />
      <path d="M16 12h4" />
      <path d="M12 4v4" />
      <path d="M12 16v4" />
    </svg>
  );
}

export function AccountIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...iconProps}>
      <path d="M12 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

export function CatIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...iconProps}>
      <path d="M7 8 5.5 4.5 9 6" />
      <path d="m17 8 1.5-3.5L15 6" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0 6.5 6.5 0 0 0-13 0z" />
      <path d="M9.2 12.2h.01" />
      <path d="M14.8 12.2h.01" />
      <path d="M12 13.2v1.2" />
      <path d="M10.5 15.3c.8.6 2.2.6 3 0" />
    </svg>
  );
}

export function BowlIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...iconProps}>
      <path d="M5 11.5h14l-1.2 4.2a4 4 0 0 1-3.8 2.8h-4a4 4 0 0 1-3.8-2.8z" />
      <path d="M7.5 8.5c1-1 2-1 3 0s2 1 3 0 2-1 3 0" />
      <path d="M8 21h8" />
    </svg>
  );
}

export function CalendarCheckIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...iconProps}>
      <path d="M5 5.5h14v14H5z" />
      <path d="M8 3.5v4" />
      <path d="M16 3.5v4" />
      <path d="M5 9h14" />
      <path d="m8.5 14.5 2 2 5-5" />
    </svg>
  );
}

export function ChecklistIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...iconProps}>
      <path d="M7 4.5h10v15H7z" />
      <path d="M9.5 8h5" />
      <path d="m9 12 1 1 2-2" />
      <path d="m9 16 1 1 2-2" />
      <path d="M14 12h1.5" />
      <path d="M14 16h1.5" />
    </svg>
  );
}

export function EventIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...iconProps}>
      <path d="M12 5v14" />
      <path d="M7 7.5h10" />
      <path d="M7 12h10" />
      <path d="M7 16.5h10" />
      <path d="M5 7.5h.01" />
      <path d="M5 12h.01" />
      <path d="M5 16.5h.01" />
    </svg>
  );
}

export function ShareIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...iconProps}>
      <path d="M8.5 13.5 15.5 17" />
      <path d="m15.5 7-7 3.5" />
      <path d="M6.5 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
      <path d="M17.5 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
      <path d="M17.5 19.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
    </svg>
  );
}

export function SparkleIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...iconProps}>
      <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" />
      <path d="m18 15 .7 2.3L21 18l-2.3.7L18 21l-.7-2.3L15 18l2.3-.7z" />
      <path d="m5.5 14 .5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5z" />
    </svg>
  );
}

export function BellIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...iconProps}>
      <path d="M6.5 10.5a5.5 5.5 0 0 1 11 0v3.5l1.5 2.5H5l1.5-2.5z" />
      <path d="M10 19a2.3 2.3 0 0 0 4 0" />
    </svg>
  );
}

export function BillingIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...iconProps}>
      <path d="M4.5 7.5h15a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18V9a1.5 1.5 0 0 1 1.5-1.5z" />
      <path d="M3 11h18" />
      <path d="M7 16h4" />
      <path d="M17 4.5v3" />
      <path d="M7 4.5v3" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...iconProps}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function UsageIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...iconProps}>
      <path d="M4.5 15.5a7.5 7.5 0 1 1 15 0" />
      <path d="M12 15.5l3.5-5" />
      <path d="M7.5 19.5h9" />
      <path d="M8 13.5h.01" />
      <path d="M16 13.5h.01" />
    </svg>
  );
}

export function DeployIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...iconProps}>
      <path d="M12 4v10" />
      <path d="M8 8l4-4 4 4" />
      <path d="M5 16.5h14" />
      <path d="M7 19.5h10" />
    </svg>
  );
}

export function GrowthIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...iconProps}>
      <path d="M5 18.5l5-5 3 3 6-8" />
      <path d="M15 8.5h4v4" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...iconProps}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

export function SignOutIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...iconProps}>
      <path d="M10 5H6.5A2.5 2.5 0 0 0 4 7.5v9A2.5 2.5 0 0 0 6.5 19H10" />
      <path d="M14 8l4 4-4 4" />
      <path d="M18 12H9" />
    </svg>
  );
}

export function RefreshIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...iconProps}>
      <path d="M20 12a8 8 0 0 1-13.4 5.9" />
      <path d="M4 12A8 8 0 0 1 17.4 6.1" />
      <path d="M17 3.5v3h-3" />
      <path d="M7 20.5v-3h3" />
    </svg>
  );
}
