import { notFound } from "next/navigation";
import Link from "next/link";

import { ErrorState } from "@xwlc/ui";

import {
  getCatBreedOption,
  getCatIllustrationSrc
} from "@/lib/catcare/cat-profile-options";
import {
  getCatCareCatDetail,
  type CatCareCat
} from "@/lib/catcare/product-service";

import { getCatCareContentContext } from "../../catcare-shell";
import { CatCareToast } from "../../catcare-toast";
import { CatCarePanel } from "../../owner-flow-components";
import { CatDetailActionsClient } from "./cat-detail-actions-client";

export default async function CatCareCatDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ delete_error?: string; plan_id?: string; saved?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const [context, catResult] = await Promise.all([
    getCatCareContentContext(),
    getCatCareCatDetail(id)
  ]);

  if (!catResult.ok && catResult.error.code === "not_found") {
    notFound();
  }

  return (
    <>
      <CatCareToast message={getCatDetailToastMessage(query.saved, context.locale)} />
      {query.delete_error ? (
        <div className="mx-auto mb-5 w-full max-w-[1196px] rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950">
          {query.delete_error === "active_share_link"
            ? context.locale === "en"
              ? "This profile is still exposed by an active share link. Revoke that link first."
              : "这只猫咪仍在一个有效分享链接中。请先进入计划撤销分享链接，再删除档案。"
            : query.delete_error === "active_plan"
            ? context.locale === "en"
              ? "This profile is still used by an active care plan. Close or delete that plan first."
              : "这只猫咪仍在进行中的照护计划里。请先关闭或删除该计划，再删除档案。"
            : context.locale === "en"
              ? "The profile could not be deleted. No data was changed; please try again."
              : "档案暂时无法删除，数据没有变化，请稍后重试。"}
          {query.plan_id ? (
            <Link className="ml-2 underline" href={`/catcare/plans/${query.plan_id}`}>
              {context.locale === "en" ? "Open plan" : "查看计划"}
            </Link>
          ) : null}
        </div>
      ) : null}
      {!catResult.ok ? (
        <ErrorState
          badgeLabel="需检查"
          description={`${catResult.error.code}: ${catResult.error.message}`}
          title="猫咪档案暂时不可用"
        />
      ) : (
        <CatDetail cat={catResult.data} locale={context.locale} />
      )}
    </>
  );
}

function getCatDetailToastMessage(value: string | undefined, locale: "zh" | "en") {
  if (value === "created") {
    return locale === "en" ? "Cat profile created" : "猫咪档案已创建";
  }

  if (value === "updated") {
    return locale === "en" ? "Cat profile saved" : "猫咪档案已保存";
  }

  return null;
}

function CatDetail({
  cat,
  locale
}: {
  cat: CatCareCat;
  locale: "zh" | "en";
}) {
  const breed = getCatBreedOption(cat.breed);
  const lifeStageLabel = {
    adult: locale === "en" ? "Adult" : "成年",
    kitten: locale === "en" ? "Kitten" : "幼猫",
    senior: locale === "en" ? "Senior" : "老年",
    unknown: locale === "en" ? "Unknown" : "未知"
  }[cat.lifeStage ?? "unknown"];
  const rows = [
    [
      locale === "en" ? "Gender" : "性别",
      cat.gender === "female"
        ? locale === "en"
          ? "Female"
          : "母猫"
        : cat.gender === "male"
          ? locale === "en"
            ? "Male"
            : "公猫"
          : locale === "en"
            ? "Not sure"
            : "未知"
    ],
    [
      locale === "en" ? "Birth date" : "生日",
      cat.birthDate ?? (locale === "en" ? "Not set" : "未填写")
    ],
    [locale === "en" ? "Breed" : "品种", locale === "en" ? breed.labelEn : breed.label],
    [locale === "en" ? "Weight" : "体重", cat.weightKg ? `${cat.weightKg} kg` : locale === "en" ? "Not set" : "未填写"],
    [locale === "en" ? "Life stage" : "生命阶段", lifeStageLabel]
  ];

  return (
    <div className="mx-auto grid w-full max-w-[1196px] gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
      <CatCarePanel>
        <img
          alt=""
          className="mx-auto h-64 w-64 rounded-full bg-[#fff8f0] object-cover"
          src={cat.photoUrl ?? getCatIllustrationSrc(breed.illustration)}
        />
        <h1 className="mt-6 break-words text-center text-4xl font-semibold leading-tight text-[#101a32]">
          {cat.name}
        </h1>
        <CatDetailActionsClient catId={cat.id} locale={locale} />
      </CatCarePanel>

      <CatCarePanel>
        <h2 className="text-2xl font-semibold text-[#101a32]">
          {locale === "en" ? "Profile details" : "档案详情"}
        </h2>
        <div className="mt-6 grid gap-3">
          {rows.map(([label, value]) => (
            <div
              className="grid gap-2 rounded-xl border border-[#e2e6ee] bg-white px-4 py-3 sm:grid-cols-[9rem_minmax(0,1fr)]"
              key={label}
            >
              <span className="text-sm font-semibold text-[#526177]">
                {label}
              </span>
              <span className="text-sm font-semibold text-[#101a32]">
                {value}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-xl bg-[#fff8f0] p-4">
          <h3 className="text-base font-semibold text-[#101a32]">
            {locale === "en" ? "Safety notes" : "安全与注意事项"}
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#526177]">
            {cat.safetyNotes || (locale === "en" ? "No special notes yet." : "暂无特殊注意事项。")}
          </p>
        </div>
      </CatCarePanel>
    </div>
  );
}
