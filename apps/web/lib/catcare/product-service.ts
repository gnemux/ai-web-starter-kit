import "server-only";

export type {
  CatCareCatalogProduct,
  CatCareCat,
  CatCareCatSummary,
  CatCareEventsWorkspace,
  CatCareEvent,
  CatCareItem,
  CatCareItemsWorkspace,
  CatCareItemTag,
  CatCareLibraryItem,
  CatCarePlan,
  CatCarePlanParticipant,
  CatCarePlanListWorkspace,
  CatCareRoutine,
  CatCareRoutineItem,
  CatCareRoutineWorkspacePreload,
  CatCareRoutineWorkspace,
  CatCareSubmission,
  CatCareTask,
  CatCareWorkspace,
  CatCareWorkspaceStats,
  CarePlanStatus,
  CareSubmissionStatus,
  CreateCareItemInput,
  CreateCatInput,
  CreatePlanInput
} from "./product-service/types";

export {
  getCatCareCatsWorkspace,
  getCatCarePlanListWorkspace,
  getCatCarePlanResultsWorkspace,
  getCatCareWorkspace
} from "./product-service/workspace";

export {
  copyCatCareRoutineFromFormData,
  getCatCareRoutineWorkspacePreload,
  getCatCareRoutineWorkspace,
  saveCatCareRoutineFromFormData
} from "./product-service/routines";

export {
  createCatCareItemFromFormData,
  deleteCatCareLibraryItemFromFormData,
  getCatCareItemsWorkspace,
  unassignCatCareItemFromFormData,
  updateCatCareLibraryItemFromFormData,
  updateCatCareLibraryItemNotesFromFormData
} from "./product-service/items";

export {
  createCatCareEventFromFormData,
  deleteCatCareEventFromFormData,
  updateCatCareEventFromFormData,
  getCatCareEventsWorkspace
} from "./product-service/events";

export {
  createCatCareCatFromFormData,
  deleteCatCareCatById,
  deleteCatCareCatFromFormData,
  getCatCareCatPhotoById,
  getCatCareCatDetail,
  updateCatCareCatFromFormData
} from "./product-service/cats";

export {
  closeCatCarePlan,
  createCatCarePlanFromFormData,
  deleteCatCarePlan,
  getCatCarePlanDetail,
  getCatCarePlanItemOptions,
  publishCatCarePlan,
  saveCatCarePlanAiRecap,
  updateCatCarePlanTasksFromFormData
} from "./product-service/plans";

export type {
  AnonymousCarePlanView,
  AnonymousCareTaskView,
  AnonymousCareTaskSubmissionView
} from "./product-service/anonymous-view";
export type {
  CarePlanShareLinkMutation,
  CarePlanShareLinkState,
  ShareTokenActorContext,
  ShareTokenResourceType,
  ShareTokenRow,
  ShareTokenScope
} from "./product-service/share-tokens";
export type { AnonymousCareSubmissionMutation } from "./product-service/anonymous-submissions";

export { getCatCareAuditActivities } from "./product-service/audit";
export type { CatCareAuditActivity } from "./product-service/audit";
export { submitAnonymousCareSubmissionFromFormData } from "./product-service/anonymous-submissions";
export { getAnonymousCarePlanView } from "./product-service/anonymous-view";

export {
  createCarePlanShareLink,
  createShareTokenExpiry,
  createShareTokenSecret,
  getCarePlanShareLinkState,
  hashShareTokenSecret,
  isShareTokenHashMatch,
  resolveCarePlanShareToken,
  revokeCarePlanShareLink,
  shareTokenResourceType,
  shareTokenScope,
  shareTokenTtlDays
} from "./product-service/share-tokens";
