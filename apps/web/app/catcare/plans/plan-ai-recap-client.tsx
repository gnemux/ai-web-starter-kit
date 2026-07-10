"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  runCatCarePlanAiRecapAction,
  type CatCareAiRecapActionState
} from "../actions";
import { formatAiCreditsAsUsesLabel } from "@/lib/services/ai-credit-format";
import { getCatCareAiRecapAvailability } from "./plan-ai-recap";

const initialState: CatCareAiRecapActionState = null;

export function CatCareAiRecapPanel({
  hasAiQuota,
  initialRecapText,
  isPlanClosed,
  isPlanDraft,
  mode,
  planId,
  requestedCredits
}: {
  hasAiQuota: boolean;
  initialRecapText?: string | null;
  isPlanClosed: boolean;
  isPlanDraft: boolean;
  mode: string;
  planId: string;
  requestedCredits: number;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    runCatCarePlanAiRecapAction,
    initialState
  );
  const result = state?.result ?? null;
  const data = result?.ok ? result.data : null;
  const recapText = data?.text ?? initialRecapText ?? null;
  const recapSections = recapText
    ? parseRecapSections(recapText)
    : [];
  const hasRecap = recapSections.length > 0;
  const duplicateRecap =
    data?.status === "blocked" && data.reason === "duplicate";
  const blockedByQuota = data?.status === "blocked" && !duplicateRecap;
  const resultPath = `/catcare/plans/${planId}/results`;
  const encodedResultPath = encodeURIComponent(resultPath);
  const availability = getCatCareAiRecapAvailability({
    hasAiQuota,
    isPlanClosed,
    isPlanDraft
  });
  const generationDisabled = pending || !availability.canGenerate;
  const disabledReason = availability.reason === "draft"
    ? "计划发布并收到结果后才能复盘。"
    : availability.reason === "closed"
      ? "已关闭计划只能查看历史结果。"
      : availability.reason === "quota_exhausted"
        ? "智能照护次数已用完，补充后可以继续生成。"
        : null;
  const showQuotaPaywall =
    availability.reason === "quota_exhausted" || blockedByQuota;

  useEffect(() => {
    if (data?.status === "succeeded") {
      router.refresh();
    }
  }, [data?.status, router]);

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-[#bfe5d7] bg-[#f6fbf8]">
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
        <div>
          <p className="text-xs font-semibold text-[#07847f]">
            智能复盘
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight text-[#101a32]">
            给本次照护生成一份主人摘要
          </h2>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#526177]">
            汇总完成情况、逾期项和异常备注，生成一份可直接阅读的结论和下一步建议。
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#526177]">
            <span className="rounded-full bg-white px-3 py-1 ring-1 ring-[#d9eee7]">
              {formatMode(mode)}
            </span>
            <span className="rounded-full bg-white px-3 py-1 ring-1 ring-[#d9eee7]">
              消耗 {formatCreditCost(requestedCredits)} 次 AI 额度
            </span>
          </div>
          <form
            action={formAction}
            className={
              hasRecap
                ? "mt-5 grid gap-3 sm:max-w-2xl sm:grid-cols-2"
                : "mt-5 grid max-w-sm gap-3"
            }
          >
            <input name="planId" type="hidden" value={planId} />
            <button
              className="min-h-12 w-full rounded-2xl bg-[#07847f] px-5 py-3 text-center text-base font-semibold text-white shadow-sm transition hover:bg-[#056f6b] disabled:cursor-not-allowed disabled:bg-[#a7c9c6]"
              disabled={generationDisabled}
              type="submit"
            >
              {pending ? "生成中" : hasRecap ? "重新生成复盘" : "生成复盘"}
            </button>
            {hasRecap ? (
              <input name="forceRecap" type="hidden" value="1" />
            ) : null}
            {hasRecap ? (
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-5 py-3 text-base font-semibold text-[#07847f] ring-1 ring-[#b9d8d3] transition hover:bg-[#f2fbf8]"
                href="#ai-recap-result"
              >
                查看复盘
              </a>
            ) : null}
            {disabledReason ? (
              <p className="text-xs font-semibold leading-5 text-[#75839a] sm:col-span-2">
                {disabledReason}
              </p>
            ) : null}
          </form>
        </div>
        <div className="flex justify-center lg:justify-end">
          <img
            alt=""
            className="h-32 w-32 object-contain mix-blend-multiply sm:h-40 sm:w-40 lg:h-48 lg:w-48"
            src="/catcare/illustrations/ai-billing-robot-cat.png"
          />
        </div>
      </div>

      {result && !result.ok ? (
        <p className="mx-5 mb-5 rounded-2xl bg-[#fff4f2] p-3 text-sm font-semibold leading-6 text-[#b7342c] sm:mx-6">
          {result.error.message}
        </p>
      ) : null}

      {duplicateRecap ? (
        <p className="mx-5 mb-5 rounded-2xl bg-[#f4fbf8] p-4 text-sm font-semibold leading-6 text-[#07847f] sm:mx-6">
          本计划已经生成过复盘，本次没有重复消耗额度。
        </p>
      ) : null}

      {showQuotaPaywall ? (
        <div className="mx-5 mb-5 rounded-2xl bg-[#fff8e6] p-4 text-sm font-semibold leading-6 text-[#8a5a00] sm:mx-6">
          <p>智能照护次数已用完。补充后会回到本页，继续生成这份复盘。</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              className="rounded-full bg-white px-3 py-1 text-[#07847f] ring-1 ring-[#b9d8d3] transition hover:bg-[#f2fbf8]"
              href={`/account/billing?return_to=${encodedResultPath}&source=catcare_ai_recap`}
            >
              查看套餐权益
            </a>
            <a
              className="rounded-full bg-white px-3 py-1 text-[#07847f] ring-1 ring-[#b9d8d3] transition hover:bg-[#f2fbf8]"
              href={`/account/payment/checkout?price_id=ai_credit_pack_100k&return_to=${encodedResultPath}`}
            >
              购买一次性智能补充包
            </a>
          </div>
        </div>
      ) : null}

      {data?.status === "failed" ? (
        <p className="mx-5 mb-5 rounded-2xl bg-[#fff4f2] p-4 text-sm font-semibold leading-6 text-[#b7342c] sm:mx-6">
          智能复盘暂时不可用，真实提交和逾期提醒不受影响。
        </p>
      ) : null}

      {hasRecap ? (
        <div className="border-t border-[#d9eee7] bg-white p-5 sm:p-6">
          <div
            className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]"
            id="ai-recap-result"
          >
            <article className="rounded-3xl border border-[#bfe5d7] bg-[#f5fbf8] p-5 shadow-sm shadow-teal-900/5">
              <p className="text-xs font-semibold text-[#07847f]">
                复盘结论
              </p>
              <h3 className="mt-2 text-2xl font-semibold leading-tight text-[#101a32]">
                {recapSections[0]?.title ?? "本次照护复盘"}
              </h3>
              <p className="mt-3 whitespace-pre-wrap text-base font-semibold leading-7 text-[#101a32]">
                {recapSections[0]?.body ?? "暂无可展示的复盘内容。"}
              </p>
            </article>

            <div className="grid gap-3">
              {recapSections.slice(1, 3).map((section) => (
                <article
                  className="rounded-3xl border border-[#e2e6ee] bg-[#fbfdfc] p-5"
                  key={section.title}
                >
                  <p className="text-sm font-semibold text-[#07847f]">
                    {section.title}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6 text-[#101a32]">
                    {section.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
          {data ? (
            <p className="mt-4 text-xs font-semibold leading-5 text-[#75839a]">
              已消耗 {formatCreditCost(data.consumedCredits)} 次 AI 额度；{formatUsageStatus(data.usageRecordStatus)}。
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function formatMode(mode: string) {
  if (mode === "mock") {
    return "当前为模拟 AI";
  }

  if (mode === "noop") {
    return "空响应模式";
  }

  if (mode === "sandbox") {
    return "沙盒模式";
  }

  return mode;
}

function formatUsageStatus(status: string) {
  if (status === "recorded") {
    return "用量已记录";
  }

  if (status === "record_deferred") {
    return "用量待记录";
  }

  return "用量未记录";
}

function formatCreditCost(value: number) {
  return formatAiCreditsAsUsesLabel(value);
}

function parseRecapSections(text: string) {
  const sections = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const [title = "复盘摘要", ...bodyLines] = block.split("\n");
      const body = bodyLines.join("\n").trim() || title;

      return {
        body,
        title: bodyLines.length > 0 ? title : "复盘摘要"
      };
    });

  return sections.length > 0
    ? sections
    : [{ body: "暂无可展示的复盘内容。", title: "复盘摘要" }];
}
