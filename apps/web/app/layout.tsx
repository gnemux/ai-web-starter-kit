import type { Metadata } from "next";
import "./globals.css";

import { getRequestLocale } from "@/lib/i18n-server";

export const metadata: Metadata = {
  applicationName: "CatCare",
  title: "CatCare",
  description: "Temporary cat-care handoff workspace.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }]
  },
  appleWebApp: {
    title: "CatCare"
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
