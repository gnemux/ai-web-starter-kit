"use server";

import { revalidatePath } from "next/cache";

import type { DemoItem, ServiceResult } from "@starter/core";

import { createDemoItemFromFormData } from "@/lib/services/demo-items";

export type DemoItemActionState = ServiceResult<DemoItem> | null;

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
