import type { AnonymousCareTaskSubmissionView } from "@/lib/catcare/product-service";

export type AnonymousTask = {
  category: "meal" | "water" | "medicine" | "litter" | "play" | "observe" | "treat" | "environment" | "other";
  frequency: string | null;
  instructions: string | null;
  locked: boolean;
  photoRequired: boolean;
  required: boolean;
  serviceDate: string;
  submission: AnonymousCareTaskSubmissionView | null;
  submissionRef: string;
  sortOrder: number;
  title: string;
  visitTime: string;
};

export type SelectedEvidence = {
  file: File;
  id: string;
  previewUrl: string;
};

export const careEvidencePickerMaxBytes = 15 * 1024 * 1024;
export const careEvidenceNetworkMaxBytes = 3 * 1024 * 1024;

export type AnonymousVisitSection = {
  tasks: AnonymousTask[];
  timeLabel: string;
};

export type AnonymousServiceDay = {
  date: string;
  dateLabel: string;
  locked: boolean;
  statusLabel: string;
  visits: AnonymousVisitSection[];
};
