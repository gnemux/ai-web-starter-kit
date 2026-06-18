export const demoItemVisibilities = ["private", "public"] as const;

export type DemoItemVisibility = (typeof demoItemVisibilities)[number];

export const demoItemStatuses = ["active", "archived"] as const;

export type DemoItemStatus = (typeof demoItemStatuses)[number];

export type UserProfile = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DemoItem = {
  id: string;
  ownerId: string;
  title: string;
  notes: string | null;
  visibility: DemoItemVisibility;
  status: DemoItemStatus;
  createdAt: string;
  updatedAt: string;
};

export type DataAccessPattern =
  | "owner-only"
  | "authenticated-public-read"
  | "service-only";

export type DataTableContract = {
  table: "user_profiles" | "demo_items";
  description: string;
  accessPattern: DataAccessPattern;
};

export const dataTableContracts: DataTableContract[] = [
  {
    table: "user_profiles",
    description: "One profile row per Supabase Auth user.",
    accessPattern: "owner-only"
  },
  {
    table: "demo_items",
    description: "Minimal user-owned business record for API and UI examples.",
    accessPattern: "authenticated-public-read"
  }
];
