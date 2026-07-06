import type { CatCareCat } from "@/lib/catcare/product-service";
import type { Locale } from "@/lib/i18n";

import { CatProfileFormClient } from "./cat-profile-form-client";

export function CatProfileForm({
  action,
  cat,
  locale,
  mode
}: {
  action: (formData: FormData) => void;
  cat?: CatCareCat;
  locale: Locale;
  mode: "create" | "edit";
}) {
  return (
    <CatProfileFormClient
      action={action}
      cat={cat}
      locale={locale}
      mode={mode}
    />
  );
}
