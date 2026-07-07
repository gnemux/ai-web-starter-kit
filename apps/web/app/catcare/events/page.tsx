import { ErrorState } from "@xwlc/ui";

import { CatCarePlusCircleIcon } from "../catcare-action-icons";
import { CatCareToast } from "../catcare-toast";
import {
  CatCareButton,
  CatCarePanel
} from "../owner-flow-components";
import { EventsWorkspaceClient } from "./events-workspace-client";
import { getCatCareEventsWorkspace } from "@/lib/catcare/product-service";

type EventsSearchParams = Promise<{ cat_id?: string; saved?: string }>;

export default async function CatCareEventsPage({
  searchParams
}: {
  searchParams: EventsSearchParams;
}) {
  const params = await searchParams;
  const result = await getCatCareEventsWorkspace(params.cat_id);

  return (
    <>
      {!result.ok ? (
        <ErrorState
          badgeLabel="Needs review"
          description={`${result.error.code}: ${result.error.message}`}
          title="事件记录暂时不可用"
        />
      ) : !result.data.selectedCat ? (
        <CatCarePanel>
          <div className="mx-auto max-w-md text-center">
            <h2 className="text-2xl font-semibold text-[#101a32]">
              还没有猫咪档案
            </h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#526177]">
              先创建猫咪档案，再记录近期健康、行为和环境事件。
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
        <>
          <CatCareToast
            message={
              params.saved === "1"
                ? "事件已保存。需关注事件会进入照护计划的生成参考。"
                : null
            }
          />
          <EventsWorkspaceClient
            cats={result.data.cats}
            events={result.data.events}
            initialCatId={result.data.selectedCat.id}
            libraryItems={result.data.libraryItems}
          />
        </>
      )}
    </>
  );
}
