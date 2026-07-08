import Link from "next/link";
import { EmptyState, ErrorState } from "@xwlc/ui";

import {
  getCatBreedOption,
  getCatIllustrationSrc
} from "@/lib/catcare/cat-profile-options";
import { getCatCareCatsWorkspace } from "@/lib/catcare/product-service";

import { CatCareEditIcon, CatCarePlusCircleIcon } from "../catcare-action-icons";
import { CatCareToast } from "../catcare-toast";
import { getCatCareContentContext } from "../catcare-shell";
import {
  CatCareButton,
  CatCarePanel
} from "../owner-flow-components";

export default async function CatCareCatsPage({
  searchParams
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const params = await searchParams;
  const [context, workspaceResult] = await Promise.all([
    getCatCareContentContext(),
    getCatCareCatsWorkspace()
  ]);
  const labels =
    context.locale === "en"
      ? {
          add: "New cat profile",
          birthdayMissing: "Birth date not set",
          description:
            "Manage each cat's profile, safety notes, and care-plan entry points.",
          emptyDescription:
            "Create the first cat profile before setting routines and travel care plans.",
          emptyTitle: "No cat profiles yet",
          title: "Cat profiles",
          view: "View and edit profile",
          weightMissing: "Weight not set"
        }
      : {
          add: "新建猫咪档案",
          birthdayMissing: "未填写生日",
          description: "管理多只猫咪的基础信息、健康注意事项和后续照护计划入口。",
          emptyDescription: "先创建第一只猫咪档案，再继续设置喂养习惯和出门照护计划。",
          emptyTitle: "还没有猫咪档案",
          title: "猫咪档案",
          view: "查看并编辑档案",
          weightMissing: "未填写体重"
        };

  return (
    <>
      <CatCareToast message={getCatsToastMessage(params.saved, context.locale)} />
      <div className="mx-auto grid w-full max-w-[1196px] gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[#101a32]">
              {labels.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#526177]">
              {labels.description}
            </p>
          </div>
          <CatCareButton href="/catcare/cats/new">
            <CatCarePlusCircleIcon />
            {labels.add}
          </CatCareButton>
        </div>

        {!workspaceResult.ok ? (
          <ErrorState
            badgeLabel="需检查"
            description={`${workspaceResult.error.code}: ${workspaceResult.error.message}`}
            title="CatCare 暂时不可用"
          />
        ) : workspaceResult.data.cats.length === 0 ? (
          <CatCarePanel>
            <EmptyState
              description={labels.emptyDescription}
              title={labels.emptyTitle}
            />
            <div className="mt-6 flex justify-center">
              <CatCareButton href="/catcare/cats/new">
                <CatCarePlusCircleIcon />
                {labels.add}
              </CatCareButton>
            </div>
          </CatCarePanel>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {workspaceResult.data.cats.map((cat) => {
              const breed = getCatBreedOption(cat.breed);
              return (
                <Link
                  className="group rounded-2xl border border-[#e2e6ee] bg-white p-5 shadow-sm shadow-slate-900/[0.04] transition hover:-translate-y-0.5 hover:border-[#07847f]/40 hover:shadow-md"
                  href={`/catcare/cats/${cat.id}`}
                  key={cat.id}
                >
                  <div className="flex items-start gap-4">
                    <img
                      alt=""
                      className="h-24 w-24 rounded-full bg-[#fff8f0] object-cover"
                      src={cat.photoUrl ?? getCatIllustrationSrc(breed.illustration)}
                    />
                    <div className="min-w-0 flex-1">
                      <h2 className="break-words text-2xl font-semibold leading-tight text-[#101a32]">
                        {cat.name}
                      </h2>
                      <p className="mt-2 text-sm font-semibold text-[#07847f]">
                        {context.locale === "en" ? breed.labelEn : breed.label}
                      </p>
                      <p className="mt-2 text-sm text-[#526177]">
                        {cat.birthDate ?? labels.birthdayMissing} · {cat.weightKg ? `${cat.weightKg} kg` : labels.weightMissing}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-dashed border-[#e2e6ee] pt-4 text-sm font-semibold">
                    <span className="text-[#526177]">{labels.view}</span>
                    <span className="text-[#07847f] transition group-hover:translate-x-1">
                      <CatCareEditIcon className="h-5 w-5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function getCatsToastMessage(value: string | undefined, locale: "zh" | "en") {
  if (value !== "deleted") {
    return null;
  }

  return locale === "en" ? "Cat profile deleted" : "猫咪档案已删除";
}
