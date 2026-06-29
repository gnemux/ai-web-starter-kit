import {
  createAnonymousTokenScope,
  defineSchemaVersion
} from "@xwlc/db";
import {
  requireAuthenticatedActor,
  requireVerifiedEmail,
  type PlatformActor
} from "@xwlc/platform";

export type ReferenceProductPackageConsumption = Readonly<{
  actorState: "verified_owner" | "blocked";
  anonymousScopePolicy: string;
  authContract: "uses_public_contract";
  dbContract: "uses_public_contract";
  packageScope: "reference_product_minimum_entry";
  schemaVersion: string;
}>;

export function getReferenceProductPackageConsumption(): ReferenceProductPackageConsumption {
  const actor: PlatformActor = {
    id: "reference-product-owner-preview",
    type: "user",
    emailVerified: true,
    metadata: {
      app: "reference_product",
      mvp_stage: "MVP3"
    }
  };
  const authenticatedResult = requireAuthenticatedActor(actor);
  const verifiedResult = authenticatedResult.ok
    ? requireVerifiedEmail(authenticatedResult.data)
    : authenticatedResult;
  const anonymousScopeResult = createAnonymousTokenScope(
    "reference-product-preview-token"
  );
  const schemaVersion = defineSchemaVersion(
    "reference-product-mvp3",
    "Reference Product package consumption checkpoint"
  );

  return {
    actorState: verifiedResult.ok ? "verified_owner" : "blocked",
    anonymousScopePolicy: anonymousScopeResult.ok
      ? anonymousScopeResult.data.policy
      : "not_run",
    authContract: "uses_public_contract",
    dbContract: "uses_public_contract",
    packageScope: "reference_product_minimum_entry",
    schemaVersion: schemaVersion.id
  };
}
