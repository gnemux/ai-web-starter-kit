import {
  demoItemVisibilities,
  type DemoItem,
  type DemoItemVisibility
} from "./data";

export type ServiceErrorCode =
  | "validation_error"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "configuration_error"
  | "system_error";

export type ServiceError = {
  code: ServiceErrorCode;
  message: string;
  fields?: Record<string, string>;
};

export type ServiceSuccess<T> = {
  ok: true;
  data: T;
};

export type ServiceFailure = {
  ok: false;
  error: ServiceError;
};

export type ServiceResult<T> = ServiceSuccess<T> | ServiceFailure;

export type CreateDemoItemInput = {
  title: string;
  notes: string | null;
  visibility: DemoItemVisibility;
};

export type DemoItemsPayload = {
  items: DemoItem[];
};

export function serviceOk<T>(data: T): ServiceSuccess<T> {
  return {
    ok: true,
    data
  };
}

export function serviceError(
  code: ServiceErrorCode,
  message: string,
  fields?: Record<string, string>
): ServiceFailure {
  return {
    ok: false,
    error: {
      code,
      message,
      ...(fields ? { fields } : {})
    }
  };
}

export function normalizeDemoItemInput(
  input: Record<string, FormDataEntryValue | null | undefined>
): ServiceResult<CreateDemoItemInput> {
  const title = String(input.title ?? "").trim();
  const notesValue = String(input.notes ?? "").trim();
  const visibilityValue = String(input.visibility ?? "private").trim();
  const visibility = isDemoItemVisibility(visibilityValue)
    ? visibilityValue
    : null;
  const fields: Record<string, string> = {};

  if (title.length < 3) {
    fields.title = "Title must be at least 3 characters.";
  }

  if (title.length > 120) {
    fields.title = "Title must be 120 characters or fewer.";
  }

  if (notesValue.length > 500) {
    fields.notes = "Notes must be 500 characters or fewer.";
  }

  if (!visibility) {
    fields.visibility = "Visibility must be private or public.";
  }

  if (Object.keys(fields).length > 0 || !visibility) {
    return serviceError(
      "validation_error",
      "Please review the highlighted fields.",
      fields
    );
  }

  return serviceOk({
    title,
    notes: notesValue.length > 0 ? notesValue : null,
    visibility
  });
}

function isDemoItemVisibility(value: string): value is DemoItemVisibility {
  return demoItemVisibilities.includes(value as DemoItemVisibility);
}
