import type { Metadata } from "next";
import "./globals.css";

import { LanguageSwitcher } from "@/components/language-switcher";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "XWLC",
  description: "eXtensible Web Launch Core."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  const copy = getDictionary(locale);

  return (
    <html lang={locale}>
      <body>
        {children}
        <div className="fixed bottom-4 right-4 z-50">
          <LanguageSwitcher labels={copy.common} locale={locale} />
        </div>
      </body>
    </html>
  );
}
