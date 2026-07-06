import { notFound } from "next/navigation";

import { ErrorState } from "@xwlc/ui";

import { getCatCareCatDetail } from "@/lib/catcare/product-service";

import { updateCatCareCatAction } from "../../../actions";
import { CatProfileForm } from "../../../cat-profile-ui";
import { getCatCareContentContext } from "../../../catcare-shell";

export default async function EditCatCareCatPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [context, catResult] = await Promise.all([
    getCatCareContentContext(),
    getCatCareCatDetail(id)
  ]);

  if (!catResult.ok && catResult.error.code === "not_found") {
    notFound();
  }

  return (
    <>
      {!catResult.ok ? (
        <ErrorState
          badgeLabel="Needs review"
          description={`${catResult.error.code}: ${catResult.error.message}`}
          title="猫咪档案暂时不可用"
        />
      ) : (
        <CatProfileForm
          action={updateCatCareCatAction}
          cat={catResult.data}
          locale={context.locale}
          mode="edit"
        />
      )}
    </>
  );
}
