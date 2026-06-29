export type SchemaVersion = Readonly<{
  id: string;
  appliedAt?: string;
  description?: string;
}>;

export type RlsPolicyKind =
  | "owner-only"
  | "anonymous-token"
  | "public-read"
  | "service-only";

export type DbAccessScope = Readonly<{
  actorId?: string;
  ownerId?: string;
  tokenId?: string;
  tenantId?: string;
  policy: RlsPolicyKind;
}>;

export type DbBoundaryResult<T> =
  | Readonly<{ ok: true; data: T }>
  | Readonly<{ ok: false; code: "missing_scope" | "scope_mismatch"; message: string }>;

export type MigrationCheck = Readonly<{
  name: string;
  status: "pass" | "fail" | "not_run";
  evidence?: string;
}>;

export type DatabaseBoundaryEvidence = Readonly<{
  schemaVersion: SchemaVersion;
  rlsChecks: readonly MigrationCheck[];
  migrationChecks: readonly MigrationCheck[];
}>;

export function defineSchemaVersion(
  id: string,
  description?: string,
  appliedAt?: string,
): SchemaVersion {
  return { id, description, appliedAt };
}

export function formatSchemaVersion(version: SchemaVersion): string {
  return version.appliedAt ? `${version.id} @ ${version.appliedAt}` : version.id;
}

export function createOwnerScope(actorId: string, ownerId: string): DbBoundaryResult<DbAccessScope> {
  if (!actorId || !ownerId) {
    return {
      ok: false,
      code: "missing_scope",
      message: "Both actorId and ownerId are required.",
    };
  }

  if (actorId !== ownerId) {
    return {
      ok: false,
      code: "scope_mismatch",
      message: "Actor scope does not match owner scope.",
    };
  }

  return {
    ok: true,
    data: {
      actorId,
      ownerId,
      policy: "owner-only",
    },
  };
}

export function createAnonymousTokenScope(tokenId: string): DbBoundaryResult<DbAccessScope> {
  if (!tokenId) {
    return {
      ok: false,
      code: "missing_scope",
      message: "tokenId is required.",
    };
  }

  return {
    ok: true,
    data: {
      tokenId,
      policy: "anonymous-token",
    },
  };
}
