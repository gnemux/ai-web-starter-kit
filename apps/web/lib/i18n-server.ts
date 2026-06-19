import { cookies } from "next/headers";

import { defaultLocale, isLocale, localeCookieName, type Locale } from "./i18n";

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(localeCookieName)?.value;

  return isLocale(value) ? value : defaultLocale;
}
