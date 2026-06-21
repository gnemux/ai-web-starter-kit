import type { Metadata } from "next";
import "./globals.css";

import { SiteFooter } from "@/components/site-footer";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

export const metadata: Metadata = {
  applicationName: "XWLC",
  title: "XWLC",
  description: "eXtensible Web Launch Core.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }]
  },
  appleWebApp: {
    title: "XWLC"
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  const copy = getDictionary(locale);
  const year = new Date().getFullYear();

  return (
    <html lang={locale}>
      <body>
        {children}
        <SiteFooter
          labels={copy.common.footer}
          languageLabels={copy.common}
          locale={locale}
          year={year}
        />
      </body>
    </html>
  );
}
