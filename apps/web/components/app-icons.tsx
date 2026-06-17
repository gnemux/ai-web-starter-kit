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
