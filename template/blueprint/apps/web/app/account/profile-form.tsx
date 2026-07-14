"use client";
import { useActionState } from "react";
import { FormField, Input, Notice } from "@xwlc/ui";
import { updateProfile, type ProfileActionState } from "@/modules/platform/auth/actions";

const initialState: ProfileActionState = { status: "idle", message: "" };

export function ProfileForm({ initialName, labels }: { initialName: string; labels: { displayName: string; displayNameHint: string; save: string; saving: string; success: string; error: string } }) {
  const [state, action, pending] = useActionState(updateProfile, initialState);
  return <form action={action} className="form">
    <FormField id="display-name" label={labels.displayName} hint={labels.displayNameHint} error={state.status === "error" ? labels.error : undefined}>
      <Input aria-describedby="display-name-hint display-name-error" id="display-name" name="displayName" defaultValue={initialName} maxLength={120} autoComplete="name" />
    </FormField>
    <button className="button" disabled={pending} type="submit">{pending ? labels.saving : labels.save}</button>
    {state.status === "success" ? <Notice variant="success">{labels.success}</Notice> : null}
  </form>;
}
