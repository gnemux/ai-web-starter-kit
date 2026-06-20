import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

type Tone = "neutral" | "ready" | "in-progress" | "planned" | "risk";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const toneClasses: Record<Tone, string> = {
  neutral: "border-slate-200 bg-white text-slate-600",
  ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "in-progress": "border-cyan-200 bg-cyan-50 text-cyan-700",
  planned: "border-amber-200 bg-amber-50 text-amber-700",
  risk: "border-rose-200 bg-rose-50 text-rose-700"
};

export function Badge({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={cx(
        "inline-flex max-w-full items-center rounded-md border px-2.5 py-1 text-xs font-medium leading-none",
        toneClasses[tone]
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({
  label,
  status
}: {
  label?: string;
  status: "ready" | "in-progress" | "planned" | "risk";
}) {
  const labels = {
    ready: "Ready",
    "in-progress": "In progress",
    planned: "Planned",
    risk: "Needs review"
  };

  return <Badge tone={status}>{label ?? labels[status]}</Badge>;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  children,
  className,
  href,
  icon,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  const classes = cx(
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500",
    variant === "primary" &&
      "bg-slate-950 text-white shadow-sm shadow-slate-900/10 hover:bg-slate-800",
    variant === "secondary" &&
      "border border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50",
    variant === "ghost" && "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
    className
  );

  if (href) {
    return (
      <a className={classes} href={href}>
        {icon}
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button className={classes} type={type} {...props}>
      {icon}
      <span>{children}</span>
    </button>
  );
}

export type ShellNavItem = {
  href: string;
  label: string;
  active?: boolean;
  icon?: ReactNode;
};

export function AppShell({
  action,
  brand,
  children,
  navItems,
  user
}: {
  action?: ReactNode;
  brand: ReactNode;
  children: ReactNode;
  navItems: ShellNavItem[];
  user?: {
    name: string;
    role: string;
  };
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
          <div className="flex h-full flex-col p-4">
            <div className="px-2 py-3">{brand}</div>
            <nav className="mt-6 space-y-1" aria-label="Primary">
              {navItems.map((item) => (
                <a
                  aria-current={item.active ? "page" : undefined}
                  className={cx(
                    "group flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                    item.active
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  )}
                  href={item.href}
                  key={item.label}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    {item.icon}
                  </span>
                  <span className="min-w-0 truncate">{item.label}</span>
                </a>
              ))}
            </nav>
            {user ? (
              <div className="mt-auto rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="truncate text-sm font-medium text-slate-900">
                  {user.name}
                </p>
                <p className="mt-1 truncate text-xs text-slate-500">{user.role}</p>
              </div>
            ) : null}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex min-h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
              <div className="lg:hidden">{brand}</div>
              <div className="ml-auto flex shrink-0 items-center gap-2">
                {action}
              </div>
            </div>
            <div className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 lg:hidden">
              {navItems.map((item) => (
                <a
                  aria-current={item.active ? "page" : undefined}
                  className={cx(
                    "inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                    item.active
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                  href={item.href}
                  key={item.label}
                >
                  {item.icon}
                  {item.label}
                </a>
              ))}
            </div>
          </header>
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export function BrandMark({
  subtitle = "eXtensible Web Launch Core"
}: {
  subtitle?: string;
}) {
  return (
    <a className="flex min-w-0 items-center gap-3" href="/">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-950 text-sm font-semibold text-white">
        X
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-slate-950">
          XWLC
        </span>
        <span className="block truncate text-xs text-slate-500">{subtitle}</span>
      </span>
    </a>
  );
}

export function SectionHeader({
  action,
  description,
  title
}: {
  action?: ReactNode;
  description?: ReactNode;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-normal text-slate-950">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Panel({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLElement> & {
  children: ReactNode;
}) {
  return (
    <section
      className={cx(
        "rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.03]",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function MetricCard({
  detail,
  label,
  status,
  statusLabel,
  value
}: {
  detail: string;
  label: string;
  status: "ready" | "in-progress" | "planned" | "risk";
  statusLabel?: string;
  value: string;
}) {
  return (
    <Panel className="min-h-36">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <StatusBadge label={statusLabel} status={status} />
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-normal text-slate-950">
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-500">{detail}</p>
    </Panel>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const boundedValue = Math.max(0, Math.min(100, value));

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-cyan-500"
        style={{ width: `${boundedValue}%` }}
      />
    </div>
  );
}

export function EmptyState({
  action,
  description,
  title
}: {
  action?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500">
        <span aria-hidden="true">+</span>
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {description}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div
      aria-label="Loading"
      className="min-h-44 rounded-lg border border-slate-200 bg-white p-4"
      role="status"
    >
      <div className="h-4 w-32 rounded bg-slate-100" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div className="flex items-center gap-3" key={index}>
            <div className="h-9 w-9 shrink-0 rounded-md bg-slate-100" />
            <div className="min-w-0 flex-1">
              <div className="h-3 w-3/4 rounded bg-slate-100" />
              <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ErrorState({
  action,
  badgeLabel = "Recoverable",
  description,
  title
}: {
  action?: ReactNode;
  badgeLabel?: string;
  description: string;
  title: string;
}) {
  return (
    <div className="min-h-44 rounded-lg border border-rose-200 bg-rose-50 p-5">
      <Badge tone="risk">{badgeLabel}</Badge>
      <h3 className="mt-4 text-sm font-semibold text-rose-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-rose-800">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function LongContent({
  children,
  label
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="min-h-44 rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <div className="mt-3 max-w-full text-sm leading-6 text-slate-600 [overflow-wrap:anywhere]">
        {children}
      </div>
    </div>
  );
}
