"use client";

import {
  localeCookieName,
  locales,
  type Locale
} from "@/lib/i18n";

type LanguageSwitcherLabels = {
  language: string;
  currentLanguage: string;
  zh: string;
  en: string;
};

export function LanguageSwitcher({
  labels,
  locale
}: {
  labels: LanguageSwitcherLabels;
  locale: Locale;
}) {
  function selectLocale(nextLocale: Locale) {
    if (nextLocale === locale) {
      return;
    }

    document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.reload();
  }

  return (
    <div
      aria-label={labels.language}
      className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white p-1 shadow-sm shadow-slate-900/[0.03]"
      role="group"
    >
      {locales.map((option) => {
        const active = option === locale;
        const label = option === "zh" ? labels.zh : labels.en;

        return (
          <button
            aria-label={`${labels.language}: ${label}`}
            aria-pressed={active}
            className={[
              "min-h-8 rounded px-2.5 text-xs font-medium transition",
              active
                ? "bg-slate-950 text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
            ].join(" ")}
            key={option}
            onClick={() => selectLocale(option)}
            title={active ? labels.currentLanguage : label}
            type="button"
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
