"use client";

import { useFormStatus } from "react-dom";

import { CatCareSaveIcon } from "../catcare-action-icons";
import { CatCareButton } from "../owner-flow-components";

export function PlanCreateSubmitButton({
  disabled = false
}: {
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <CatCareButton disabled={pending || disabled} fullWidth type="submit">
      <CatCareSaveIcon />
      {pending ? "生成中…" : "智能生成并确认清单"}
    </CatCareButton>
  );
}
