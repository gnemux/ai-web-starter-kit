import { notFound } from "next/navigation";

import { ErrorState } from "@xwlc/ui";

import {
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

  return (
    <>
      {!result.ok ? (
        <ErrorState
          badgeLabel="Needs review"
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
        />
      )}
    </>
  );
}
