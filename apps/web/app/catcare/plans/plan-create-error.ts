export const planCreateErrorKinds = [
  "cats",
  "date",
  "routine",
  "validation"
] as const;

export type PlanCreateErrorKind = (typeof planCreateErrorKinds)[number];

export function getPlanCreateErrorKind(
  fields?: Record<string, string>
): PlanCreateErrorKind {
  if (fields?.routine) {
    return "routine";
  }

  if (fields?.startOn || fields?.endOn) {
    return "date";
  }

  if (fields?.catIds) {
    return "cats";
  }

  return "validation";
}

export function getPlanCreateErrorRedirect(
  fields?: Record<string, string>,
  selectedCatId?: string
) {
  const params = new URLSearchParams({
    plan_error: getPlanCreateErrorKind(fields)
  });

  if (selectedCatId && isUuid(selectedCatId)) {
    params.set("cat_id", selectedCatId);
  }

  return `/catcare/plans?${params.toString()}`;
}

export function parsePlanCreateErrorKind(
  value?: string
): PlanCreateErrorKind | null {
  return planCreateErrorKinds.includes(value as PlanCreateErrorKind)
    ? (value as PlanCreateErrorKind)
    : null;
}

export function shouldSelectPlanCatByDefault(input: {
  catId: string;
  disabled: boolean;
  selectedCatId?: string | null;
}) {
  return (
    !input.disabled &&
    (input.selectedCatId ? input.catId === input.selectedCatId : true)
  );
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}
