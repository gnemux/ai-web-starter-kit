"use client";
import { useEffect, type ReactNode } from "react";

export function Toast({ children, open = true, duration = 4000, onDismiss }: { children: ReactNode; open?: boolean; duration?: number; onDismiss?: () => void }) {
  useEffect(() => {
    if (!open || !onDismiss || duration <= 0) return;
    const timer = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onDismiss, open]);
  if (!open) return null;
  return <div aria-live="polite" className="toast" role="status"><span>{children}</span>{onDismiss ? <button aria-label="Dismiss notification" onClick={onDismiss} type="button">×</button> : null}</div>;
}
