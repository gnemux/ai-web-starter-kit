import type { MouseEventHandler, ReactNode } from "react";
import Link from "next/link";

export function CatCareStepBar({
  steps
}: {
  steps: Array<{ label: string; active?: boolean }>;
}) {
  return (
    <div className="mx-auto flex w-full max-w-full items-center justify-start gap-3 overflow-x-auto py-3 sm:gap-6 xl:justify-center">
      {steps.map((step, index) => (
        <div className="flex items-center gap-6" key={step.label}>
          {index > 0 ? <span className="h-px w-10 bg-[#b8c1cf] sm:w-28" /> : null}
          <div className="flex items-center gap-4">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold ${
                step.active
                  ? "bg-[#07847f] text-white"
                  : "bg-[#edf1f5] text-[#526177]"
              }`}
            >
              {index + 1}
            </span>
            <span
              className={`whitespace-nowrap text-base font-semibold ${
                step.active ? "text-[#07847f]" : "text-[#263a59]"
              }`}
            >
              {step.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CatCarePanel({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#e2e6ee] bg-white p-7 shadow-sm shadow-slate-900/[0.04]">
      {children}
    </section>
  );
}

export function CatCareField({
  children,
  error,
  label
}: {
  children: ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <div className="grid content-start gap-3 text-[#243653]">
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {error ? (
        <span className="text-xs font-semibold leading-5 text-[#b33a2f]">
          {error}
        </span>
      ) : null}
    </div>
  );
}

export const catCareInputClass =
  "h-14 w-full rounded-lg border border-[#d9e0ea] bg-white px-5 text-base font-semibold leading-none text-[#16233b] outline-none transition placeholder:text-[#98a4b5] focus:border-[#07847f] focus:ring-4 focus:ring-[#07847f]/10";

const catCareButtonClasses = {
  danger:
    "border border-[#f0c9c2] bg-white text-[#b33a2f] hover:border-[#d86255] hover:bg-[#fff4f2]",
  primary:
    "border border-[#07847f] bg-[#07847f] text-white shadow-sm shadow-teal-900/20 hover:bg-[#06706c]",
  secondary:
    "border border-[#07847f] bg-white text-[#07847f] hover:bg-[#f2fbf8]",
  ghost:
    "border border-[#d9e0ea] bg-white text-[#243653] hover:border-[#07847f]/50 hover:bg-[#f7fbfa]"
};

export function CatCareButton({
  children,
  fullWidth = false,
  disabled = false,
  form,
  href,
  name,
  onClick,
  type = "button",
  value,
  variant = "primary"
}: {
  children: ReactNode;
  disabled?: boolean;
  form?: string;
  fullWidth?: boolean;
  href?: string;
  name?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit";
  value?: string;
  variant?: keyof typeof catCareButtonClasses;
}) {
  const className = `inline-flex min-h-14 items-center justify-center gap-3 whitespace-nowrap rounded-xl px-5 text-base font-semibold leading-none transition [&>[data-catcare-action-icon]]:h-5 [&>[data-catcare-action-icon]]:w-5 [&>img]:h-5 [&>img]:w-5 [&>img]:shrink-0 ${fullWidth ? "w-full" : ""} ${catCareButtonClasses[variant]}`;

  if (href) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={className}
      disabled={disabled}
      form={form}
      name={name}
      onClick={onClick}
      type={type}
      value={value}
    >
      {children}
    </button>
  );
}

export function CatCareActionButton({
  children,
  href,
  icon,
  name,
  onClick,
  type = "button",
  value,
  variant = "primary"
}: {
  children: ReactNode;
  href?: string;
  icon: ReactNode;
  name?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit";
  value?: string;
  variant?: keyof typeof catCareButtonClasses;
}) {
  const className = `grid min-h-14 w-full grid-cols-[5.25rem_minmax(0,1fr)] items-center rounded-xl px-5 text-base font-semibold leading-none transition ${catCareButtonClasses[variant]}`;
  const content = (
    <>
      <span className="flex h-5 w-5 justify-self-end text-current [&>[data-catcare-action-icon]]:h-5 [&>[data-catcare-action-icon]]:w-5 [&>img]:h-5 [&>img]:w-5 [&>img]:shrink-0">
        {icon}
      </span>
      <span className="min-w-0 pl-4 text-left">{children}</span>
    </>
  );

  if (href) {
    return (
      <Link className={className} href={href}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={className}
      name={name}
      onClick={onClick}
      type={type}
      value={value}
    >
      {content}
    </button>
  );
}

export function CatCareBottomActions({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4 pt-3 sm:grid-cols-3">
      {children}
    </div>
  );
}
