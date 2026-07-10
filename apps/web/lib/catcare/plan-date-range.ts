export function validateCatCarePlanDateRange(input: {
  endOn: string | null;
  startOn: string | null;
  today: string;
}) {
  const fields: Record<string, string> = {};

  if (!input.startOn) {
    fields.startOn = "required";
  }

  if (!input.endOn) {
    fields.endOn = "required";
  }

  if (input.startOn && input.startOn < input.today) {
    fields.startOn = "past";
  }

  if (input.startOn && input.endOn && input.endOn < input.startOn) {
    fields.endOn = "invalid";
  }

  return fields;
}
