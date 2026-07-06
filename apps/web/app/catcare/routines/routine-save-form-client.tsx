"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import type { CatCareRoutine } from "@/lib/catcare/product-service";
import { CatCareToast, useCatCareToast } from "../catcare-toast";

type RoutineSaveResult =
  | { data: CatCareRoutine; ok: true }
  | { error: { message: string }; ok: false };

export function RoutineSaveForm({
  action,
  catId,
  children,
  savedMessage
}: {
  action: (formData: FormData) => Promise<RoutineSaveResult>;
  catId: string;
  children: ReactNode;
  savedMessage: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const toast = useCatCareToast();

  return (
    <>
      <CatCareToast message={null} toast={toast.toast} />
      <form
        action={async (formData) => {
          setPending(true);

          const intent = String(formData.get("intent") ?? "stay");
          const result = await action(formData);

          setPending(false);

          if (!result.ok) {
            toast.showError(result.error.message);
            return;
          }

          if (intent === "items") {
            router.push(`/catcare/items?cat_id=${result.data.catId}&saved=routine`);
            return;
          }

          toast.showSuccess(savedMessage);
        }}
        className={`grid gap-6 ${pending ? "pointer-events-none opacity-70" : ""}`}
      >
        <input name="catId" type="hidden" value={catId} />
        {children}
      </form>
    </>
  );
}
