import { notFound } from "next/navigation";

import { ErrorState } from "@xwlc/ui";

import {
  getCarePlanShareLinkState,
  getCatCareAuditActivities,
  getCatCarePlanDetail,
  getCatCarePlanItemOptions
} from "@/lib/catcare/product-service";
import { PlanDetailClient } from "../plan-detail-client";

type PlanPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ closed?: string; published?: string; saved?: string }>;
};

export default async function CatCarePlanDetailPage({
  params,
  searchParams
}: PlanPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const result = await getCatCarePlanDetail(id, { includeSubmissions: false });

  if (!result.ok && result.error.code === "not_found") {
    notFound();
  }

  const itemOptionsResult =
    result.ok && result.data.status === "draft"
      ? await getCatCarePlanItemOptions()
      : null;
  const shareLinkResult =
    result.ok ? await getCarePlanShareLinkState(result.data.id) : null;
  const auditResult =
    result.ok ? await getCatCareAuditActivities(result.data.ownerId, result.data.id) : null;

  return (
    <>
      {!result.ok ? (
        <ErrorState
          badgeLabel="需检查"
          description={`${result.error.code}: ${result.error.message}`}
          title="照护计划暂时不可用"
        />
      ) : (
        <PlanDetailClient
          justClosed={query.closed === "1"}
          justPublished={query.published === "1"}
          justSaved={query.saved === "1"}
          itemOptions={itemOptionsResult?.ok ? itemOptionsResult.data : []}
          plan={result.data}
          auditActivities={auditResult?.ok ? auditResult.data : []}
          shareLinkState={
            shareLinkResult?.ok
              ? shareLinkResult.data
              : {
                  expiresAt: null,
                  generatedAt: null,
                  revokedAt: null,
                  status: "not_generated"
                }
          }
        />
      )}
    </>
  );
}
