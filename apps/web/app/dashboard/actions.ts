"use server";

import { revalidatePath } from "next/cache";

import type {
  AiGenerateTextResponse,
  DemoItem,
  ServiceResult
} from "@starter/core";

import { generateAiTextFromFormData } from "@/lib/services/ai";
import { createDemoItemFromFormData } from "@/lib/services/demo-items";

export type DemoItemActionState = ServiceResult<DemoItem> | null;
export type WorkspaceAiActionState =
  ServiceResult<AiGenerateTextResponse> | null;

export async function createDemoItemAction(
  _previousState: DemoItemActionState,
  formData: FormData
): Promise<DemoItemActionState> {
  const result = await createDemoItemFromFormData(formData);

  if (result.ok) {
    revalidatePath("/dashboard");
  }

  return result;
}

export async function runWorkspaceAiAction(
  _previousState: WorkspaceAiActionState,
  formData: FormData
): Promise<WorkspaceAiActionState> {
  return generateAiTextFromFormData(formData);
}
