"use client";

import {
  useEffect,
  useRef,
  type RefObject
} from "react";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

export function useDialogFocusBoundary({
  active,
  containerRef,
  initialFocusRef,
  lockBodyScroll = false,
  onClose,
  returnFocusRef
}: {
  active: boolean;
  containerRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  lockBodyScroll?: boolean;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
}) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;

    if (lockBodyScroll) {
      document.body.style.overflow = "hidden";
    }

    const focusTarget =
      initialFocusRef?.current ??
      getFocusableElements(containerRef.current)[0] ??
      containerRef.current;
    focusTarget?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const container = containerRef.current;
      const focusable = getFocusableElements(container);

      if (!container || focusable.length === 0) {
        event.preventDefault();
        container?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (
        event.shiftKey &&
        (current === first || !container.contains(current))
      ) {
        event.preventDefault();
        last?.focus();
      } else if (
        !event.shiftKey &&
        (current === last || current === container || !container.contains(current))
      ) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);

      if (lockBodyScroll) {
        document.body.style.overflow = previousOverflow;
      }

      (returnFocusRef?.current ?? previousFocus)?.focus();
    };
  }, [
    active,
    containerRef,
    initialFocusRef,
    lockBodyScroll,
    returnFocusRef
  ]);
}

function getFocusableElements(container: HTMLElement | null) {
  if (!container) {
    return [];
  }

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector))
    .filter((element) => {
      const style = window.getComputedStyle(element);
      return (
        element.getAttribute("aria-hidden") !== "true" &&
        style.display !== "none" &&
        style.visibility !== "hidden"
      );
    });
}
