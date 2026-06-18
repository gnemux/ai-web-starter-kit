export * from "./data";

export type ProductTrack = {
  name: string;
  description: string;
};

export type CapabilityStatus = "ready" | "in-progress" | "planned" | "risk";

export type CapabilityTrack = {
  name: string;
  description: string;
  owner: string;
  status: CapabilityStatus;
  progress: number;
};

export type DashboardAction = {
  issue: string;
  title: string;
  description: string;
  status: CapabilityStatus;
};

export type IntegrationStatus = {
  name: string;
  description: string;
  status: CapabilityStatus;
};

export type ReadinessMetric = {
  label: string;
  value: string;
  detail: string;
  status: CapabilityStatus;
};

export const productTracks: ProductTrack[] = [
  {
    name: "AI Rules",
    description: "Context, specs, status, and repeatable AI coding rules."
  },
  {
    name: "Auth",
    description: "Sign up, sign in, protected routes, and user profile."
  },
  {
    name: "Data",
    description: "Profile table, demo business table, migrations, seed, and RLS."
  },
  {
    name: "API",
    description: "Service layer, provider boundaries, and typed business results."
  },
  {
    name: "Payment",
    description: "Checkout, orders, subscriptions, and entitlement."
  },
  {
    name: "Analytics",
    description: "Events, funnels, validation signals, and monitoring."
  }
];

export const readinessMetrics: ReadinessMetric[] = [
  {
    label: "Product tracks",
    value: "10",
    detail: "Foundation, UI, data, API, auth, billing, payment, analytics, deploy, growth",
    status: "ready"
  },
  {
    label: "Open app issues",
    value: "3",
    detail: "App shell, dashboard, and UI edge states are being shaped now",
    status: "in-progress"
  },
  {
    label: "Provider coupling",
    value: "Low",
    detail: "External services stay behind documented adapters",
    status: "ready"
  }
];

export const capabilityTracks: CapabilityTrack[] = [
  {
    name: "App shell",
    description: "Navigation, page containers, responsive layout, and reusable workspace chrome.",
    owner: "Frontend",
    status: "in-progress",
    progress: 72
  },
  {
    name: "Dashboard",
    description: "Command center for module readiness, next actions, and integration state.",
    owner: "Product UI",
    status: "in-progress",
    progress: 64
  },
  {
    name: "Auth",
    description: "Supabase session, user profile, protected route, and account settings.",
    owner: "Auth",
    status: "planned",
    progress: 12
  },
  {
    name: "Data",
    description: "Profile table, demo business table, local migration workflow, and RLS template.",
    owner: "Data",
    status: "in-progress",
    progress: 58
  },
  {
    name: "API",
    description: "Service layer and provider boundaries that keep data access out of pages.",
    owner: "API",
    status: "planned",
    progress: 0
  },
  {
    name: "Billing",
    description: "Plan model, entitlement checks, subscription states, and lifecycle rules.",
    owner: "Billing",
    status: "planned",
    progress: 8
  },
  {
    name: "Payment",
    description: "Sandbox provider first, checkout flow second, real provider decision later.",
    owner: "Payment",
    status: "planned",
    progress: 10
  },
  {
    name: "Analytics",
    description: "Typed events, provider adapter, conversion funnel, and production checks.",
    owner: "Analytics",
    status: "planned",
    progress: 10
  }
];

export const dashboardActions: DashboardAction[] = [
  {
    issue: "GNE-82",
    title: "Ship reusable app shell",
    description: "Stabilize navigation, layout, and page containers for future feature pages.",
    status: "in-progress"
  },
  {
    issue: "GNE-84",
    title: "Frame the dashboard workspace",
    description: "Expose readiness, capability tracks, next actions, and demo user state.",
    status: "in-progress"
  },
  {
    issue: "GNE-85",
    title: "Bake in edge states",
    description: "Make empty, loading, error, and long-content states visible from day one.",
    status: "in-progress"
  },
  {
    issue: "GNE-108",
    title: "Connect preview deployments",
    description: "Let every PR produce a Vercel preview once the app foundation is ready.",
    status: "planned"
  },
  {
    issue: "GNE-132",
    title: "Ship the DATA foundation",
    description: "Create the profile/demo tables, migration, seed guidance, and RLS template.",
    status: "in-progress"
  },
  {
    issue: "GNE-133",
    title: "Define the API service layer",
    description: "Keep pages behind services before Auth, Billing, and Payment implementation starts.",
    status: "planned"
  }
];

export const integrationStatuses: IntegrationStatus[] = [
  {
    name: "Supabase",
    description: "Auth and database provider documented with local migration workflow.",
    status: "in-progress"
  },
  {
    name: "Vercel",
    description: "Deployment rules and environment placeholders are ready for preview setup.",
    status: "ready"
  },
  {
    name: "Payment",
    description: "Sandbox-first provider boundary is planned before selecting a real provider.",
    status: "planned"
  },
  {
    name: "Analytics",
    description: "Provider adapter and event naming still need implementation.",
    status: "planned"
  }
];

export const longContentSample =
  "This deliberately long item demonstrates how the product shell handles verbose implementation notes, long Linear titles, provider caveats, and AI-generated explanations without breaking the layout or forcing horizontal scrolling.";
