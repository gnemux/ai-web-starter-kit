import type { Metadata } from "next";

import {
  getAnonymousCarePlanView,
  type AnonymousCarePlanView,
  type AnonymousCareTaskView
} from "@/lib/catcare/product-service";

import {
  formatTaskAction,
  getCategoryLabel,
  getCategoryStyle,
  parseTaskTitle
} from "../../catcare/plans/plan-task-display";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "CatCare 照护交接",
  description: "Private CatCare handoff view."
};

type SharePageProps = {
  params: Promise<{ token: string }>;
};

export default async function AnonymousCarePlanPage({ params }: SharePageProps) {
  const { token } = await params;
  const result = await getAnonymousCarePlanView(token);

  return (
    <main className="min-h-screen bg-[#f7f3ee] px-4 py-5 text-[#101a32] sm:px-6">
      <div className="mx-auto grid w-full max-w-2xl gap-4">
        <AnonymousHeader />
        {result.ok ? (
          <AnonymousCarePlan plan={result.data} />
        ) : (
          <ShareErrorState
            kind={result.error.fields?.token}
            message={result.error.message}
          />
        )}
      </div>
    </main>
  );
}

function AnonymousHeader() {
  return (
    <header className="flex items-center justify-between gap-4 rounded-[22px] border border-[#e2e6ee] bg-white px-4 py-3 shadow-sm shadow-slate-900/[0.04]">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden">
          <img
            alt=""
            aria-hidden="true"
            className="h-12 w-12 object-contain"
            src="/catcare/brand-mark.png"
          />
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-[#101a32]">CatCare</p>
          <p className="truncate text-xs font-semibold text-[#526177]">
            私密照护交接
          </p>
        </div>
      </div>
      <span className="shrink-0 rounded-full bg-[#e6f7f2] px-3 py-1 text-xs font-semibold text-[#07847f]">
        照看者只读
      </span>
    </header>
  );
}

function AnonymousCarePlan({ plan }: { plan: AnonymousCarePlanView }) {
  const optionalCount = plan.taskCount - plan.requiredTaskCount;

  return (
    <>
      <section className="rounded-[24px] border border-[#d9eee7] bg-[#f2fbf8] p-5 shadow-sm shadow-slate-900/[0.04]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#07847f] ring-1 ring-[#bfe5d7]">
            可查看
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#526177] ring-1 ring-[#d9e0ea]">
            有效期至 {formatDateTime(plan.expiresAt)}
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold leading-tight text-[#101a32]">
          {plan.title}
        </h1>
        <p className="mt-3 text-base font-semibold leading-7 text-[#526177]">
          这是 {formatList(plan.catNames)} 的临时照护交接。先阅读主人交代，再按任务清单执行。
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <SummaryCard label="照护猫咪" value={formatList(plan.catNames)} />
          <SummaryCard label="照护日期" value={formatDateRange(plan)} />
          <SummaryCard
            label="任务构成"
            value={`${plan.requiredTaskCount} 必做 / ${optionalCount} 可选`}
          />
        </div>
        <a
          className="mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-xl border border-[#07847f] bg-[#07847f] px-5 text-base font-semibold text-white shadow-sm shadow-teal-900/20 transition hover:bg-[#06706c]"
          href="#tasks"
        >
          查看任务清单
        </a>
      </section>

      {plan.handoffNotes ? (
        <section className="rounded-[22px] border border-[#e2e6ee] bg-white p-5 shadow-sm shadow-slate-900/[0.04]">
          <p className="text-sm font-semibold text-[#07847f]">主人交代</p>
          <p className="mt-3 whitespace-pre-wrap break-words text-base font-semibold leading-7 text-[#101a32]">
            {plan.handoffNotes}
          </p>
        </section>
      ) : null}

      <section
        className="rounded-[22px] border border-[#e2e6ee] bg-white p-5 shadow-sm shadow-slate-900/[0.04]"
        id="tasks"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#07847f]">照护任务</p>
            <h2 className="mt-1 text-2xl font-semibold text-[#101a32]">
              按时间和重点逐项执行
            </h2>
          </div>
          <span className="text-sm font-semibold text-[#526177]">
            共 {plan.taskCount} 项
          </span>
        </div>
        <div className="mt-5 grid gap-3">
          {plan.tasks.map((task) => (
            <TaskCard key={`${task.sortOrder}-${task.title}`} task={task} />
          ))}
        </div>
      </section>

      <p className="pb-6 text-center text-xs font-semibold leading-5 text-[#75839a]">
        这个页面只显示主人授权的照护信息。提交反馈将在下一步开放。
      </p>
    </>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-[#d9eee7]">
      <p className="text-xs font-semibold text-[#75839a]">{label}</p>
      <p className="mt-2 break-words text-base font-semibold text-[#101a32]">
        {value}
      </p>
    </div>
  );
}

function TaskCard({ task }: { task: AnonymousCareTaskView }) {
  const title = parseTaskTitle(task.title);

  return (
    <article className="rounded-2xl border border-[#e2e6ee] bg-[#fbfdfc] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${getCategoryStyle(task.category)}`}
        >
          {getCategoryLabel(task.category)}
        </span>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#526177] ring-1 ring-[#d9e0ea]">
          {task.required ? "必做" : "可选"}
        </span>
        {task.timeHint ? (
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#526177] ring-1 ring-[#d9e0ea]">
            {task.timeHint}
          </span>
        ) : null}
      </div>
      <h3 className="mt-3 break-words text-lg font-semibold leading-7 text-[#101a32]">
        {formatTaskAction(task.title)}
      </h3>
      {title.owner ? (
        <p className="mt-1 text-sm font-semibold text-[#526177]">
          适用猫咪：{title.owner}
        </p>
      ) : null}
      <p className="mt-2 text-sm font-semibold leading-6 text-[#526177]">
        {formatFrequency(task.frequency)}
      </p>
      {task.instructions ? (
        <p className="mt-3 whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-[#101a32]">
          {task.instructions}
        </p>
      ) : null}
    </article>
  );
}

function ShareErrorState({
  kind,
  message
}: {
  kind: string | undefined;
  message: string;
}) {
  const meta = {
    expired: {
      label: "已过期",
      title: "分享链接已过期",
      description: "请联系主人重新生成新的照护链接。"
    },
    invalid: {
      label: "不可用",
      title: "分享链接不可用",
      description: "链接可能复制不完整，或并不是有效的 CatCare 私密链接。"
    },
    revoked: {
      label: "已撤销",
      title: "分享链接已撤销",
      description: "主人已经撤销这个链接，照看者无法继续查看照护计划。"
    },
    unavailable: {
      label: "已关闭",
      title: "照护计划暂不可用",
      description: "这个计划当前不再开放给照看者查看。"
    }
  }[kind ?? "invalid"] ?? {
    label: "不可用",
    title: "分享链接不可用",
    description: message
  };

  return (
    <section className="rounded-[24px] border border-[#e2e6ee] bg-white p-6 shadow-sm shadow-slate-900/[0.04]">
      <span className="rounded-full bg-[#f2f4f7] px-3 py-1 text-xs font-semibold text-[#526177]">
        {meta.label}
      </span>
      <h1 className="mt-5 text-3xl font-semibold leading-tight text-[#101a32]">
        {meta.title}
      </h1>
      <p className="mt-3 text-base font-semibold leading-7 text-[#526177]">
        {meta.description}
      </p>
      <div className="mt-6 rounded-2xl bg-[#fbfdfc] px-4 py-4 ring-1 ring-[#e2e6ee]">
        <p className="text-sm font-semibold leading-6 text-[#526177]">
          为保护主人和猫咪信息，CatCare 不会在无效链接中展示任何照护内容。
        </p>
      </div>
    </section>
  );
}

function formatList(values: string[]) {
  return values.length > 0 ? values.join("、") : "猫咪";
}

function formatDateRange(plan: Pick<AnonymousCarePlanView, "endOn" | "startOn">) {
  if (!plan.startOn) {
    return "按主人交代";
  }

  return plan.endOn && plan.endOn !== plan.startOn
    ? `${plan.startOn} 至 ${plan.endOn}`
    : plan.startOn;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatFrequency(value: string | null) {
  if (!value) {
    return "按现场情况执行";
  }

  const match = /^(daily|every_2_days|weekly)(?:_(\d+))?$/.exec(value);
  const count = match?.[2] ?? "1";

  if (match?.[1] === "weekly") {
    return `每周 ${count} 次`;
  }

  if (match?.[1] === "every_2_days") {
    return `每 2 日 ${count} 次`;
  }

  return `每日 ${count} 次`;
}
