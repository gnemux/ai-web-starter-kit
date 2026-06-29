import {
  normalizeDemoItemInput,
  serviceError,
  serviceOk,
  type CreateDemoItemInput,
  type DemoItem,
  type DemoItemsPayload,
  type ServiceResult
} from "@xwlc/core";
import {
  createOwnerScope,
  type DbAccessScope,
  type DbBoundaryResult
} from "@xwlc/db";

import {
  createSupabaseServerClient,
  type AppSupabaseClient
} from "../supabase/server";
import type { Database } from "../supabase/database.types";

type DemoItemRow = Database["public"]["Tables"]["demo_items"]["Row"];
type OwnerDbAccessScope = DbAccessScope & Readonly<{ ownerId: string }>;

export async function listDemoItems(): Promise<
  ServiceResult<DemoItemsPayload>
> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerScopeResult = await getAuthenticatedOwnerScope(clientResult.data);

  if (!ownerScopeResult.ok) {
    return ownerScopeResult;
  }

  const { data, error } = await clientResult.data
    .from("demo_items")
    .select(
      "id, owner_id, title, notes, visibility, status, created_at, updated_at"
    )
    .or(`owner_id.eq.${ownerScopeResult.data.ownerId},visibility.eq.public`)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return mapSupabaseError(error);
  }

  return serviceOk({
    items: (data ?? []).map(mapDemoItem)
  });
}

export async function createDemoItemFromFormData(
  formData: FormData
): Promise<ServiceResult<DemoItem>> {
  const inputResult = normalizeDemoItemInput({
    title: formData.get("title"),
    notes: formData.get("notes"),
    visibility: formData.get("visibility")
  });

  if (!inputResult.ok) {
    return inputResult;
  }

  return createDemoItem(inputResult.data);
}

export async function createDemoItem(
  input: CreateDemoItemInput
): Promise<ServiceResult<DemoItem>> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const ownerScopeResult = await getAuthenticatedOwnerScope(clientResult.data);

  if (!ownerScopeResult.ok) {
    return ownerScopeResult;
  }

  const { data, error } = await clientResult.data
    .from("demo_items")
    .insert({
      owner_id: ownerScopeResult.data.ownerId,
      title: input.title,
      notes: input.notes,
      visibility: input.visibility
    })
    .select(
      "id, owner_id, title, notes, visibility, status, created_at, updated_at"
    )
    .single();

  if (error) {
    return mapSupabaseError(error);
  }

  return serviceOk(mapDemoItem(data));
}

async function getAuthenticatedOwnerScope(
  supabase: AppSupabaseClient
): Promise<ServiceResult<OwnerDbAccessScope>> {
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !userId) {
    return serviceError(
      "unauthorized",
      "Sign in before using demo business data."
    );
  }

  const scopeResult = createOwnerScope(userId, userId);

  if (!scopeResult.ok) {
    return mapDbBoundaryError(scopeResult);
  }

  return serviceOk({
    ...scopeResult.data,
    ownerId: userId
  });
}

function mapDbBoundaryError(
  result: Extract<DbBoundaryResult<unknown>, { ok: false }>
): ServiceResult<never> {
  return serviceError(
    result.code === "scope_mismatch" ? "forbidden" : "unauthorized",
    result.message
  );
}

function mapDemoItem(row: DemoItemRow): DemoItem {
  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    notes: row.notes,
    visibility: row.visibility,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapSupabaseError(error: { code?: string }): ServiceResult<never> {
  if (error.code === "42501") {
    return serviceError(
      "forbidden",
      "This account does not have access to that data."
    );
  }

  if (error.code === "23505") {
    return serviceError("conflict", "A matching record already exists.");
  }

  if (error.code === "PGRST116") {
    return serviceError("not_found", "The requested record was not found.");
  }

  return serviceError(
    "system_error",
    "The demo data service is temporarily unavailable."
  );
}
