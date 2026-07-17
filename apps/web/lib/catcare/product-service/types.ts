import type { Database } from "../../supabase/database.types";
import type { CatGender, CatLifeStage } from "../cat-profile-options";

export type CatRow = Database["public"]["Tables"]["cats"]["Row"];
export type CareRoutineRow = Database["public"]["Tables"]["care_routines"]["Row"];
export type CareRoutineItemRow =
  Database["public"]["Tables"]["care_routine_items"]["Row"];
export type CareItemRow = Database["public"]["Tables"]["care_items"]["Row"];
export type ProductCatalogRow =
  Database["public"]["Tables"]["catcare_product_catalog"]["Row"];
export type OwnerItemLibraryRow =
  Database["public"]["Tables"]["owner_item_library"]["Row"];
export type CatItemAssignmentRow =
  Database["public"]["Tables"]["cat_item_assignments"]["Row"];
export type CareEventRow = Database["public"]["Tables"]["care_events"]["Row"];
export type CarePlanRow = Database["public"]["Tables"]["care_plans"]["Row"];
export type CarePlanCatRow =
  Database["public"]["Tables"]["care_plan_cats"]["Row"];
export type CareTaskRow = Database["public"]["Tables"]["care_tasks"]["Row"];
export type CareTaskInsert = Database["public"]["Tables"]["care_tasks"]["Insert"];
export type CareSubmissionRow =
  Database["public"]["Tables"]["care_submissions"]["Row"];
export type CareSubmissionAttachmentRow =
  Database["public"]["Tables"]["care_submission_attachments"]["Row"];

export type CarePlanStatus = "draft" | "published" | "reviewed" | "closed";
export type CareSubmissionStatus = "completed" | "note" | "exception";

export type CatCareCat = {
  id: string;
  ownerId: string;
  name: string;
  gender: CatGender | null;
  birthDate: string | null;
  lifeStage: CatLifeStage | null;
  breed: string | null;
  weightKg: number | null;
  photoUrl: string | null;
  safetyNotes: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CatCareCatSummary = Pick<CatCareCat, "id" | "name">;

export type CatCareTask = {
  id: string;
  planId: string;
  category: CareTaskRow["category"];
  enabled: boolean;
  frequency: string | null;
  title: string;
  timeHint: string | null;
  instructions: string | null;
  sortOrder: number;
  required: boolean;
  photoRequired: boolean;
  source: CareTaskRow["source"];
};

export type CatCareRoutineItem = {
  id: string;
  routineId: string;
  category: CareRoutineItemRow["category"];
  title: string;
  frequency: string;
  timeHint: string | null;
  instructions: string | null;
  enabled: boolean;
  sortOrder: number;
};

export type CatCareRoutine = {
  id: string;
  ownerId: string;
  catId: string;
  title: string;
  source: CareRoutineRow["source"];
  isDefault: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: CatCareRoutineItem[];
};

export type CatCareItem = {
  id: string;
  ownerId: string;
  catId: string;
  ownerItemId: string | null;
  itemType: OwnerItemLibraryRow["item_type"];
  name: string;
  brand: string | null;
  defaultAmount: string | null;
  defaultFrequency: string | null;
  instructions: string | null;
  visibleToSitter: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CatCareLibraryItem = {
  id: string;
  ownerId: string;
  catalogProductId: string | null;
  itemType: OwnerItemLibraryRow["item_type"];
  name: string;
  brand: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CatCareItemTag = {
  id: string;
  catId: string;
  defaultAmount: string | null;
  defaultFrequency: string | null;
  instructions: string | null;
  ownerItemId: string;
  visibleToSitter: boolean;
};

export type CatCareCatalogProduct = {
  id: string;
  itemType: ProductCatalogRow["item_type"];
  displayName: string;
  brand: string | null;
};

export type CatCareEvent = {
  id: string;
  ownerId: string;
  catId: string;
  eventType: CareEventRow["event_type"];
  title: string;
  note: string | null;
  relatedItemName: string | null;
  severity: CareEventRow["severity"];
  occurredOn: string | null;
  startedOn: string | null;
  endedOn: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CatCareRoutineWorkspace = {
  cats: CatCareCatSummary[];
  items: CatCareItem[];
  libraryItems: CatCareLibraryItem[];
  routineSourceCats: Array<{ id: string; name: string }>;
  selectedCat: CatCareCatSummary | null;
  routine: CatCareRoutine | null;
};

export type CatCareRoutineWorkspacePreload = CatCareRoutineWorkspace & {
  itemsByCatId: Record<string, CatCareItem[]>;
  routineByCatId: Record<string, CatCareRoutine | null>;
  routineSourceCatsByCatId: Record<string, Array<{ id: string; name: string }>>;
};

export type CatCareItemsWorkspace = {
  cats: CatCareCatSummary[];
  selectedCat: CatCareCatSummary | null;
  items: CatCareItem[];
  itemTags: CatCareItemTag[];
  libraryItems: CatCareLibraryItem[];
  catalogProducts: CatCareCatalogProduct[];
  routineOwnerItemKeys: string[];
  routineOwnerItemKeysByCatId: Record<string, string[]>;
  routineItems: CatCareRoutineItem[];
};

export type CatCareEventsWorkspace = {
  cats: CatCareCatSummary[];
  selectedCat: CatCareCatSummary | null;
  events: CatCareEvent[];
  libraryItems: CatCareLibraryItem[];
};

export type CatCareSubmission = {
  id: string;
  ownerId: string;
  planId: string;
  taskId: string | null;
  submittedByLabel: string;
  status: CareSubmissionStatus;
  abnormal: boolean;
  note: string | null;
  idempotencyKey: string | null;
  createdAt: string;
  attachments: import("./care-evidence").CatCareEvidenceAttachment[];
};

export type CatCarePlan = {
  id: string;
  ownerId: string;
  catId: string | null;
  title: string;
  status: CarePlanStatus;
  generationSource: CarePlanRow["generation_source"];
  scenario: CarePlanRow["scenario"];
  aiInputSummary: Database["public"]["Tables"]["care_plans"]["Row"]["ai_input_summary"];
  startOn: string | null;
  endOn: string | null;
  handoffNotes: string | null;
  publishedAt: string | null;
  reviewedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
  submissionCount?: number;
  participants: CatCarePlanParticipant[];
  tasks: CatCareTask[];
  submissions: CatCareSubmission[];
};

export type CatCarePlanParticipant = {
  catId: string | null;
  deletedAt: string | null;
  nameSnapshot: string;
  sortOrder: number;
};

export type CatCareWorkspace = {
  cats: CatCareCatSummary[];
  eventCount: number;
  itemCount: number;
  planCount: number;
  publishedPlanCount: number;
  routineCount: number;
  submissionCount: number;
};

export type CatCareWorkspaceStats = Omit<CatCareWorkspace, "cats">;

export type CatCareCatsWorkspace = {
  cats: CatCareCat[];
};

export type CatCarePlanListWorkspace = {
  cats: CatCareCatSummary[];
  plans: CatCarePlan[];
};

export type CreateCatInput = {
  name: string;
  gender: CatGender;
  birthDate: string | null;
  lifeStage: CatLifeStage;
  breed: string | null;
  weightKg: number | null;
  photoUrl: string | null;
  safetyNotes: string | null;
  notes: string | null;
};

export type CreatePlanInput = {
  catId: string;
  catIds: string[];
  scenario: CarePlanRow["scenario"];
  title: string;
  visitCount: number;
  startOn: string | null;
  endOn: string | null;
  handoffNotes: string | null;
  tasks: Array<{
    title: string;
    instructions: string | null;
    sortOrder: number;
    required: boolean;
    category?: CareTaskRow["category"];
    enabled?: boolean;
    frequency?: string | null;
    source?: CareTaskRow["source"];
    sourceRef?: string | null;
    timeHint?: string | null;
  }>;
};

export type CreateCareItemInput = {
  catId?: string;
  currentCatId?: string | null;
  defaultAmount?: string | null;
  defaultFrequency?: string | null;
  instructions: string | null;
  itemType: OwnerItemLibraryRow["item_type"];
  name: string;
  visibleToSitter?: boolean;
};
