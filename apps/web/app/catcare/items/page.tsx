import { ErrorState } from "@xwlc/ui";

import {
  CatCarePlusCircleIcon
} from "../catcare-action-icons";
import { normalizeCatCareItemType } from "../catcare-item-types";
import {
  CatCareButton,
  CatCarePanel
} from "../owner-flow-components";
import { ItemsWorkspaceClient } from "./items-workspace-client";
import { getCatCareItemsWorkspace } from "@/lib/catcare/product-service";

type ItemsSearchParams = Promise<{
  cat_id?: string;
  error?: string;
  item_type?: string;
  saved?: string;
}>;

export default async function CatCareItemsPage({
  searchParams
}: {
  searchParams: ItemsSearchParams;
}) {
  const params = await searchParams;
  const result = await getCatCareItemsWorkspace(params.cat_id);
  const initialItemType = normalizeCatCareItemType(params.item_type);

  return (
    <>
      {!result.ok ? (
        <ErrorState
          badgeLabel="Needs review"
          description={`${result.error.code}: ${result.error.message}`}
          title="食物用品暂时不可用"
        />
      ) : !result.data.selectedCat ? (
        <CatCarePanel>
          <div className="mx-auto max-w-md text-center">
            <h2 className="text-2xl font-semibold text-[#101a32]">
              还没有猫咪档案
            </h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#526177]">
              先创建猫咪档案，再补充食物、猫砂、药品和照护用品。
            </p>
          </div>
          <div className="mt-6 flex justify-center">
            <CatCareButton href="/catcare/cats/new">
              <CatCarePlusCircleIcon />
              新建猫咪档案
            </CatCareButton>
          </div>
        </CatCarePanel>
      ) : (
        <ItemsWorkspaceClient
          catalogProducts={result.data.catalogProducts}
          cats={result.data.cats}
          error={params.error}
          initialItemTags={result.data.itemTags}
          initialItemType={initialItemType}
          initialLibraryItems={result.data.libraryItems}
          routineOwnerItemKeys={result.data.routineOwnerItemKeys}
          routineOwnerItemKeysByCatId={result.data.routineOwnerItemKeysByCatId}
          saved={params.saved}
          selectedCat={result.data.selectedCat}
        />
      )}
    </>
  );
}
