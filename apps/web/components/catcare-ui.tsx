import type { ReactNode } from "react";

import {
  CatCareAiIcon,
  CatCareAiChecklistIcon,
  CatCareCareEventsIcon,
  CatCareDashboardIcon,
  CatCareFeedingRoutineIcon,
  CatCareProfileIcon,
  CatCareResultsReviewIcon,
  CatCareShareLinkIcon,
  CatCareSitterIcon
} from "./catcare-icons";

export function CatCareIconFrame({
  children,
  className = "",
  size = "md"
}: {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "lg"
      ? "h-16 w-16 [&_img]:h-8 [&_img]:w-8 [&_svg]:h-8 [&_svg]:w-8"
      : size === "sm"
        ? "h-11 w-11 [&_img]:h-5 [&_img]:w-5 [&_svg]:h-5 [&_svg]:w-5"
        : "h-14 w-14 [&_img]:h-7 [&_img]:w-7 [&_svg]:h-7 [&_svg]:w-7";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[#e6f7f2] text-teal-700 shadow-inner shadow-white ring-8 ring-[#f2fbf8] ${sizeClass} ${className}`}
    >
      {children}
    </span>
  );
}

export function CatCareProductFrame({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-none overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.05] ${className}`}
    >
      {children}
    </div>
  );
}

export function CatCareHeroImage({
  className = "",
  compact = false
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-[#fff8f0] ${compact ? "rounded-3xl" : ""} ${className}`}
    >
      <img
        alt=""
        className="h-full min-h-[16rem] w-full object-cover"
        src="/catcare/hero-handoff.png"
      />
    </div>
  );
}

type FlowStep = {
  description: string;
  title: string;
};

export function CatCareFlowStrip({ steps }: { steps: readonly FlowStep[] }) {
  const icons = [
    <CatCareProfileIcon className="h-7 w-7" key="profile" />,
    <CatCareFeedingRoutineIcon className="h-7 w-7" key="routine" />,
    <CatCareCareEventsIcon className="h-7 w-7" key="events" />,
    <CatCareAiChecklistIcon className="h-7 w-7" key="checklist" />,
    <CatCareShareLinkIcon className="h-7 w-7" key="share" />,
    <CatCareSitterIcon className="h-7 w-7" key="sitter" />,
    <CatCareResultsReviewIcon className="h-7 w-7" key="results" />,
    <CatCareAiIcon className="h-7 w-7" key="review" />
  ];

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-5 shadow-sm shadow-slate-900/[0.03] sm:px-6">
      <div className="grid gap-4 md:grid-cols-4 xl:grid-cols-8">
        {steps.map((step, index) => (
          <div
            className="relative grid min-h-[6.15rem] justify-items-center text-center"
            key={`${step.title}-${index}`}
          >
            {index > 0 ? (
              <span className="absolute -left-5 top-[1.05rem] hidden text-2xl font-semibold text-teal-700 xl:block">
                →
              </span>
            ) : null}
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c9f6eb] text-sm font-semibold text-teal-800">
              {index + 1}
            </span>
            <span className="mt-2 flex h-12 w-12 items-center justify-center [&_img]:h-9 [&_img]:w-9 [&_svg]:h-9 [&_svg]:w-9">
              {icons[index] ?? <CatCareDashboardIcon className="h-9 w-9" />}
            </span>
            <h3 className="mt-3 text-sm font-semibold leading-5 text-slate-950">
              {step.title}
            </h3>
            {step.description ? (
              <p className="text-xs leading-4 text-slate-500">
                {step.description}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CatCarePricingCard({
  description,
  featured = false,
  image = "free",
  price,
  title
}: {
  description: string;
  featured?: boolean;
  image?: "free" | "pro" | "credit";
  price: string;
  title: string;
}) {
  const imageSrc = {
    free: "/catcare/card-cat-free.png",
    pro: "/catcare/card-cat-pro.png",
    credit: "/catcare/card-cat-credit.png"
  }[image];
  const [amount, unit] = price.split(" / ");
  const titleMatch = title.match(/^(.*?)（(.+)）$/);
  const titleText = titleMatch?.[1] ?? title;
  const titleNote = titleMatch?.[2];

  return (
    <div
      className={`relative min-h-[11.8rem] overflow-hidden rounded-[22px] border bg-white p-5 shadow-sm shadow-slate-900/[0.03] sm:p-6 ${
        featured
          ? "border-teal-300 ring-1 ring-teal-200"
          : "border-slate-200"
      }`}
    >
      <div className="grid h-full grid-cols-[minmax(0,1fr)_10rem] gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <div className="relative z-10 min-w-0 self-start">
          <div className="flex flex-wrap items-center gap-3">
            {featured ? (
              <span className="rounded-lg bg-teal-700 px-2.5 py-1 text-sm font-semibold text-white shadow-sm shadow-teal-900/10">
                Pro
              </span>
            ) : null}
            <h3 className="text-2xl font-semibold text-slate-950">
              {titleText}
            </h3>
            {titleNote ? (
              <span className="text-base font-medium text-slate-500">
                （{titleNote}）
              </span>
            ) : null}
          </div>
          <p className="mt-3 flex flex-wrap items-baseline gap-2 text-slate-950">
            <span className="text-4xl font-semibold tracking-normal sm:text-[3.4rem]">
              {amount}
            </span>
            {unit ? (
              <span className="text-xl font-medium text-slate-600">
                / {unit}
              </span>
            ) : null}
          </p>
          <p className="mt-3 text-base leading-7 text-slate-600">
            {description}
          </p>
        </div>
        <div className="relative self-end overflow-hidden rounded-2xl">
          <img
            alt=""
            aria-hidden="true"
            className="h-40 w-full object-contain object-bottom opacity-95 sm:h-44"
            src={imageSrc}
          />
        </div>
      </div>
    </div>
  );
}

export function CatCareMetricCard({
  icon,
  label,
  sublabel,
  value
}: {
  icon: ReactNode;
  label: string;
  sublabel: string;
  value: number | string;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.03] sm:p-5">
      <div className="flex items-start gap-4">
        <CatCareIconFrame className="!h-14 !w-14 !bg-[#e6f7f2] !ring-0 [&_img]:!h-9 [&_img]:!w-9">
          {icon}
        </CatCareIconFrame>
        <div>
          <p className="text-base font-semibold text-slate-700">{label}</p>
          <p className="mt-1 text-sm text-slate-500">{sublabel}</p>
          <p className="mt-4 break-words text-[clamp(2rem,3vw,3.25rem)] font-semibold leading-none text-slate-950">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
