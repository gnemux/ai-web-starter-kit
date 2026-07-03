import {
  createAnonymousTokenScope,
  defineSchemaVersion,
  formatSchemaVersion
} from "@xwlc/db";
import {
  requireAuthenticatedActor,
  requireVerifiedEmail,
  type PlatformActor
} from "@xwlc/platform";

export type CatCarePackageConsumption = Readonly<{
  actorState: "verified_owner" | "blocked";
  anonymousScopePolicy: string;
  authContract: "uses_public_contract";
  dbContract: "uses_public_contract";
  packageScope: "catcare_minimum_entry";
  schemaVersion: string;
}>;

export function getCatCarePackageConsumption(): CatCarePackageConsumption {
  const actor: PlatformActor = {
    id: "catcare-owner-preview",
    type: "user",
    emailVerified: true,
    metadata: {
      app: "catcare",
      mvp_stage: "MVP3"
    }
  };
  const authenticatedResult = requireAuthenticatedActor(actor);
  const verifiedResult = authenticatedResult.ok
    ? requireVerifiedEmail(authenticatedResult.data)
    : authenticatedResult;
  const anonymousScopeResult = createAnonymousTokenScope(
    "catcare-preview-token"
  );
  const schemaVersion = defineSchemaVersion(
    "catcare-mvp3",
    "CatCare package consumption checkpoint"
  );

  return {
    actorState: verifiedResult.ok ? "verified_owner" : "blocked",
    anonymousScopePolicy: anonymousScopeResult.ok
      ? anonymousScopeResult.data.policy
      : "not_run",
    authContract: "uses_public_contract",
    dbContract: "uses_public_contract",
    packageScope: "catcare_minimum_entry",
    schemaVersion: formatSchemaVersion(schemaVersion)
  };
}
