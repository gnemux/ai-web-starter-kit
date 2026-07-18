"use client";

import {
  CatCareCopyIcon,
  CatCareLinkIcon,
  CatCareXIcon
} from "../catcare-action-icons";
import {
  createCarePlanShareLinkLocalAction,
  revokeCarePlanShareLinkLocalAction
} from "../actions";
import { CatCareButton } from "../owner-flow-components";
import type {
  CarePlanShareLinkMutation,
  CarePlanShareLinkState,
  CatCareAuditActivity,
  CatCarePlan
} from "@/lib/catcare/product-service";

type ShareLinkMutationResult =
  | { data: CarePlanShareLinkMutation; ok: true }
  | { error: { message: string }; ok: false };

export function createImmediateShareActivity(
  actionName: "share" | "revoke-share",
  regenerated: boolean,
  result: CarePlanShareLinkMutation
): CatCareAuditActivity {
  const occurredAt =
    actionName === "share"
      ? result.generatedAt ?? new Date().toISOString()
      : result.revokedAt ?? new Date().toISOString();

  if (actionName === "share") {
    return {
      description: "拿到有效链接的人可以查看授权照护信息。",
      id: `local-share-${occurredAt}`,
      kind: "success",
      occurredAt,
      title: regenerated ? "私密链接已重新生成" : "私密链接已生成"
    };
  }

  return {
    description: "旧链接不能继续访问，已提交结果仍保留。",
    id: `local-revoke-${occurredAt}`,
    kind: "warning",
    occurredAt,
    title: "私密链接已撤销"
  };
}

export function AuditActivityList({
  activities
}: {
  activities: CatCareAuditActivity[];
}) {
  if (activities.length === 0) {
    return (
      <p className="mt-3 rounded-2xl border border-[#e2e6ee] bg-[#fbfdfc] px-4 py-3 text-sm font-semibold leading-6 text-[#526177]">
        暂无分享访问记录。生成链接、撤销链接或照看者提交后，这里会显示给主人看的安全活动。
      </p>
    );
  }

  return (
    <ol className="mt-4 grid gap-3">
      {activities.map((activity) => (
        <li
          className="grid grid-cols-[0.75rem_minmax(0,1fr)] gap-3 rounded-2xl border border-[#e2e6ee] bg-[#fbfdfc] p-3"
          key={activity.id}
        >
          <span
            className={`mt-1 h-3 w-3 rounded-full ${getAuditActivityDotClass(activity.kind)}`}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[#101a32]">
                {activity.title}
              </h3>
              <time className="text-xs font-semibold text-[#75839a]">
                {formatShareDate(activity.occurredAt)}
              </time>
            </div>
            <p className="mt-1 text-sm font-semibold leading-6 text-[#526177]">
              {activity.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function getAuditActivityDotClass(kind: CatCareAuditActivity["kind"]) {
  if (kind === "success") {
    return "bg-[#07847f]";
  }

  if (kind === "warning") {
    return "bg-[#d1662f]";
  }

  return "bg-[#6f7fa3]";
}

export function ShareLinkPanel({
  copyableShareUrl,
  onCopy,
  onRunShareAction,
  pendingAction,
  plan,
  shareLink
}: {
  copyableShareUrl: string | null;
  onCopy: () => void;
  onRunShareAction: (
    formData: FormData,
    action: (formData: FormData) => Promise<ShareLinkMutationResult>,
    actionName: "share" | "revoke-share"
  ) => Promise<void>;
  pendingAction: "share" | "revoke-share" | null;
  plan: CatCarePlan;
  shareLink: CarePlanShareLinkState;
}) {
  const status = getShareLinkStatusMeta(shareLink.status);
  const canGenerate = plan.status === "published";
  const canRevoke = shareLink.status === "active";
  const hasCopyableShareUrl = Boolean(copyableShareUrl);
  const isActiveShareLink = shareLink.status === "active";

  return (
    <div className="mt-4 grid gap-4">
      <div className="rounded-2xl border border-[#e2e6ee] bg-[#fbfdfc] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
            {status.label}
          </span>
          {shareLink.expiresAt && shareLink.status !== "revoked" ? (
            <span className="text-xs font-semibold text-[#526177]">
              {shareLink.status === "active" ? "有效期至" : "过期"}：
              {formatShareDate(shareLink.expiresAt)}
            </span>
          ) : null}
        </div>
        <p className="mt-3 text-sm leading-6 text-[#526177]">
          {getShareLinkDescription(plan.status, shareLink.status)}
        </p>
      </div>

      {copyableShareUrl ? (
        <div className="grid gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#526177]">
            本次生成的链接
          </span>
          <div className="rounded-xl border border-[#d9e0ea] bg-white px-3 py-3 text-sm font-semibold text-[#101a32]">
            <span className="block truncate">{formatShareUrlPreview(copyableShareUrl)}</span>
          </div>
        </div>
      ) : null}

      <div className="grid w-full gap-3 [&_form]:w-full [&_button]:w-full">
        {isActiveShareLink ? (
          hasCopyableShareUrl ? (
            <CatCareButton fullWidth onClick={onCopy} type="button">
              <CatCareCopyIcon />
              分享链接
            </CatCareButton>
          ) : (
            <div className="grid gap-2">
              <span
                aria-disabled="true"
                className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-xl border border-[#d9e0ea] bg-[#f7f9fb] px-5 text-base font-semibold leading-none text-[#98a4b5] [&>[data-catcare-action-icon]]:h-5 [&>[data-catcare-action-icon]]:w-5"
              >
                <CatCareLinkIcon />
                分享链接
              </span>
              <span className="text-xs font-semibold leading-5 text-[#66758c]">
                完整链接只在生成后显示一次；需要再次分享时请重新生成。
              </span>
            </div>
          )
        ) : null}
        <div
          className={`grid gap-3 ${
            isActiveShareLink && canGenerate && canRevoke ? "grid-cols-2" : "sm:max-w-[18rem]"
          }`}
        >
        {canGenerate ? (
          <form
            action={(formData) =>
              onRunShareAction(formData, createCarePlanShareLinkLocalAction, "share")
            }
            aria-busy={pendingAction === "share"}
            className={pendingAction ? "pointer-events-none opacity-70" : ""}
          >
            <input name="planId" type="hidden" value={plan.id} />
            <CatCareButton
              disabled={pendingAction !== null}
              fullWidth
              type="submit"
              variant={isActiveShareLink && hasCopyableShareUrl ? "secondary" : "primary"}
            >
              <CatCareLinkIcon />
              {pendingAction === "share"
                ? isActiveShareLink
                  ? "正在重新生成…"
                  : "正在生成链接…"
                : isActiveShareLink
                  ? "重新生成"
                  : "生成分享链接"}
            </CatCareButton>
          </form>
        ) : null}
        {canRevoke ? (
          <form
            action={(formData) =>
              onRunShareAction(formData, revokeCarePlanShareLinkLocalAction, "revoke-share")
            }
            aria-busy={pendingAction === "revoke-share"}
            className={pendingAction ? "pointer-events-none opacity-70" : ""}
          >
            <input name="planId" type="hidden" value={plan.id} />
            <CatCareButton
              disabled={pendingAction !== null}
              fullWidth
              type="submit"
              variant="ghost"
            >
              <CatCareXIcon />
              {pendingAction === "revoke-share" ? "正在撤销…" : "撤销链接"}
            </CatCareButton>
          </form>
        ) : null}
        </div>
      </div>
      <p className="rounded-xl bg-[#fff4e8] px-4 py-3 text-sm font-semibold leading-6 text-[#b85d00] ring-1 ring-[#efd1ad]">
        安全提醒：这是私密链接，任何拿到有效链接的人都能查看授权照护信息并提交结果，请只发给可信照看者。重新生成会撤销旧链接，已提交结果仍保留。
      </p>
    </div>
  );
}

export function getShareLinkStatusMeta(status: CarePlanShareLinkState["status"]) {
  if (status === "active") {
    return { className: "bg-[#e6f7f2] text-[#07847f]", label: "已生成" };
  }

  if (status === "expired") {
    return { className: "bg-[#fff8e6] text-[#8a5a00]", label: "已过期" };
  }

  if (status === "revoked") {
    return { className: "bg-[#f2f4f7] text-[#526177]", label: "已撤销" };
  }

  return { className: "bg-[#eef4ff] text-[#315a9f]", label: "未生成" };
}

function getShareLinkDescription(
  planStatus: CatCarePlan["status"],
  shareStatus: CarePlanShareLinkState["status"]
) {
  if (planStatus === "draft") {
    return "计划发布后才能生成私密分享链接。";
  }

  if (planStatus === "closed") {
    return "计划已关闭，不能生成新的分享链接；已撤销链接不会再允许照看者访问。";
  }

  if (shareStatus === "active") {
    return "链接已可分享。重新生成会撤销旧链接，并只显示一次新的可复制链接。";
  }

  if (shareStatus === "revoked") {
    return "链接已撤销，照看者无法继续访问。可以重新生成一个新链接。";
  }

  if (shareStatus === "expired") {
    return "链接已过期，照看者无法继续访问。可以重新生成一个新链接。";
  }

  return "生成后会得到一次性可复制链接；系统只保留安全校验信息，不保存完整链接。";
}

function formatShareDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatShareUrlPreview(value: string) {
  const [origin, token] = value.split("/s/");

  if (!origin || !token || token.length <= 14) {
    return value;
  }

  return `${origin}/s/${token.slice(0, 6)}...${token.slice(-6)}`;
}
