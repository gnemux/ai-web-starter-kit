"use client";

import { useEffect, useState } from "react";

type CatCareToastTone = "danger" | "error" | "success";
type CatCareToastValue = {
  id: number;
  message: string;
  tone: CatCareToastTone;
} | null;

export function useCatCareToast() {
  const [toast, setToast] = useState<CatCareToastValue>(null);

  return {
    showError: (message: string) =>
      setToast({ id: Date.now(), message, tone: "error" }),
    showDanger: (message: string) =>
      setToast({ id: Date.now(), message, tone: "danger" }),
    showSuccess: (message: string) =>
      setToast({ id: Date.now(), message, tone: "success" }),
    toast
  };
}

export function CatCareToast({
  message,
  toast,
  tone = "success"
}: {
  message: string | null;
  toast?: CatCareToastValue;
  tone?: CatCareToastTone;
}) {
  const displayedMessage = toast?.message ?? message;
  const displayedTone = toast?.tone ?? tone;
  const [visible, setVisible] = useState(Boolean(displayedMessage));

  useEffect(() => {
    if (!displayedMessage) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 3200);

    return () => window.clearTimeout(timer);
  }, [displayedMessage, toast?.id]);

  if (!displayedMessage || !visible) {
    return null;
  }

  const className =
    displayedTone === "error" || displayedTone === "danger"
      ? "border-[#f0c9c2] bg-[#fff7f5] text-[#b33a2f]"
      : "border-[#bfe5d7] bg-[#f2fbf8] text-[#07847f]";

  return (
    <div
      className={`fixed left-1/2 top-5 z-50 w-fit max-w-[calc(100vw-2rem)] -translate-x-1/2 whitespace-nowrap rounded-2xl border px-5 py-4 text-center text-sm font-semibold leading-6 shadow-lg shadow-slate-900/10 ${className}`}
      role={displayedTone === "error" ? "alert" : "status"}
    >
      {displayedMessage}
    </div>
  );
}
