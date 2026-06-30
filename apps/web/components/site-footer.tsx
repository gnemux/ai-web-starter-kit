import { BrandMark } from "@xwlc/ui";

import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/lib/i18n";

type SiteFooterLabels = {
  ariaLabel: string;
  description: string;
  languageTitle: string;
  productTitle: string;
  productLinks: {
    home: string;
    signUp: string;
    login: string;
    demo: string;
    dashboard: string;
    referenceProduct: string;
    account: string;
    billing: string;
    usage: string;
  };
  capabilitiesTitle: string;
  capabilities: readonly string[];
  resourcesTitle: string;
  resources: readonly string[];
  copyright: string;
};

type LanguageLabels = {
  brandSubtitle: string;
  language: string;
  currentLanguage: string;
  zh: string;
  en: string;
};

export function SiteFooter({
  labels,
  languageLabels,
  locale,
  year
}: {
  labels: SiteFooterLabels;
  languageLabels: LanguageLabels;
  locale: Locale;
  year: number;
}) {
  const productLinks = [
    { href: "/", label: labels.productLinks.home },
    { href: "/login?mode=signup", label: labels.productLinks.signUp },
    { href: "/login", label: labels.productLinks.login },
    { href: "/reference-product", label: labels.productLinks.referenceProduct },
    { href: "/account", label: labels.productLinks.account },
    { href: "/account/billing", label: labels.productLinks.billing },
    { href: "/account/usage", label: labels.productLinks.usage }
  ];

  return (
    <footer
      aria-label={labels.ariaLabel}
      className="border-t border-slate-200 bg-white text-slate-950"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_2fr]">
          <div className="min-w-0">
            <BrandMark subtitle={languageLabels.brandSubtitle} />
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
              {labels.description}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <FooterColumn title={labels.productTitle}>
              <nav aria-label={labels.productTitle} className="space-y-2">
                {productLinks.map((link) => (
                  <a
                    className="block text-sm leading-6 text-slate-500 transition hover:text-slate-950"
                    href={link.href}
                    key={link.href}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </FooterColumn>

            <FooterColumn title={labels.capabilitiesTitle}>
              <FooterList items={labels.capabilities} />
            </FooterColumn>

            <FooterColumn title={labels.resourcesTitle}>
              <FooterList items={labels.resources} />
            </FooterColumn>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-5 border-t border-slate-200 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm leading-6 text-slate-500">
            {labels.copyright.replace("{year}", String(year))}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <p className="text-sm font-medium text-slate-600">
              {labels.languageTitle}
            </p>
            <LanguageSwitcher labels={languageLabels} locale={locale} />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  children,
  title
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="min-w-0">
      <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function FooterList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li className="text-sm leading-6 text-slate-500" key={item}>
          {item}
        </li>
      ))}
    </ul>
  );
}
