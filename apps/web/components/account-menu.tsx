"use client";

import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode
} from "react";

import {
  AccountIcon,
  BillingIcon,
  ChevronDownIcon,
  DashboardIcon,
  SignOutIcon,
  UsageIcon
} from "@/components/app-icons";
import { resetAnalytics, trackEvent } from "@/lib/analytics/client";
import { signOutAction, type SignOutState } from "@/app/account/actions";

type AccountMenuLabels = {
  account: string;
  billing: string;
  dashboard: string;
  label: string;
  signedIn: string;
  signOut: string;
  usage: string;
  working: string;
};

export function AccountMenu({
  avatarUrl,
  email,
  labels,
  name
}: {
  avatarUrl?: string | null;
  email: string;
  labels: AccountMenuLabels;
  name: string;
}) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<SignOutState, FormData>(
    signOutAction,
    null
  );
  const initial = getAccountInitial(name || email);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (state?.ok) {
      trackEvent("user_logged_out", {
        auth_provider: "supabase",
        result: "success"
      });
      resetAnalytics();
      window.location.assign(state.data.redirectTo);
    }
  }, [state]);

  function handleSignOutSubmit() {
    resetAnalytics();
  }

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        aria-controls={open ? menuId : undefined}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={labels.label}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2 text-sm font-medium text-slate-700 shadow-sm shadow-slate-900/[0.03] transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <AccountAvatar alt={labels.label} initial={initial} src={avatarUrl} />
        <span className="hidden max-w-32 truncate sm:block">{name}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-slate-400 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-12 z-30 w-64 overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl shadow-slate-900/10"
          id={menuId}
          role="menu"
        >
          <div className="border-b border-slate-100 p-3">
            <p className="text-xs font-medium text-emerald-700">
              {labels.signedIn}
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-950">
              {name}
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-500">{email}</p>
          </div>
          <div className="p-1.5">
            <AccountMenuLink
              href="/dashboard"
              icon={<DashboardIcon />}
              label={labels.dashboard}
            />
            <AccountMenuLink
              href="/account"
              icon={<AccountIcon />}
              label={labels.account}
            />
            <AccountMenuLink
              href="/account/billing"
              icon={<BillingIcon />}
              label={labels.billing}
            />
            <AccountMenuLink
              href="/account/usage"
              icon={<UsageIcon />}
              label={labels.usage}
            />
            <form action={formAction} onSubmit={handleSignOutSubmit}>
              <button
                className="flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPending}
                role="menuitem"
                type="submit"
              >
                <SignOutIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {isPending ? labels.working : labels.signOut}
                </span>
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AccountAvatar({
  alt,
  initial,
  src
}: {
  alt: string;
  initial: string;
  src?: string | null;
}) {
  if (src) {
    return (
      <img
        alt={alt}
        className="h-8 w-8 rounded-full border border-slate-200 object-cover"
        src={src}
      />
    );
  }

  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
      {initial}
    </span>
  );
}

function AccountMenuLink({
  href,
  icon,
  label
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <a
      className="flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
      href={href}
      role="menuitem"
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </a>
  );
}

function getAccountInitial(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "X";
}
