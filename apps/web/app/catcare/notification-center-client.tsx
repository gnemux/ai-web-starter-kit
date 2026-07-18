"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type MouseEvent
} from "react";

import { BellIcon } from "@/components/app-icons";
import { trackCatCareEvent } from "@/lib/analytics/client";
import type { Dictionary, Locale } from "@/lib/i18n";
import type {
  OwnerNotificationCenter,
  OwnerNotificationView
} from "@/lib/catcare/product-service";

import {
  markAllOwnerNotificationsReadAction,
  markOwnerNotificationReadAction
} from "./notification-actions";
import { useDialogFocusBoundary } from "./use-dialog-focus-boundary";

type NotificationLabels = Dictionary["catcare"]["owner"]["notifications"];

export function CatCareNotificationCenter({
  center,
  labels,
  locale
}: {
  center: OwnerNotificationCenter;
  labels: NotificationLabels;
  locale: Locale;
}) {
  const router = useRouter();
  const panelRef = useRef<HTMLElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(center.notifications);
  const [unreadCount, setUnreadCount] = useState(center.unreadCount);
  const [pending, startTransition] = useTransition();

  useDialogFocusBoundary({
    active: isOpen,
    containerRef: panelRef,
    initialFocusRef: panelRef,
    onClose: () => setIsOpen(false),
    returnFocusRef: triggerRef
  });

  useEffect(() => {
    if (!isOpen) return;

    function closeOnOutsideClick(event: PointerEvent) {
      if (
        rootRef.current &&
        event.target instanceof Node &&
        !rootRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
    };
  }, [isOpen]);

  function toggleCenter() {
    setError(null);
    setIsOpen((current) => {
      const next = !current;
      if (next) {
        trackCatCareEvent("catcare_notification_center_opened", {
          status: center.status,
          surface: "owner"
        });
      }
      return next;
    });
  }

  function openNotification(notification: OwnerNotificationView) {
    setError(null);
    startTransition(async () => {
      const result = await markOwnerNotificationReadAction(notification.id);

      if (!result.ok) {
        setError(labels.actionError);
        return;
      }

      markReadLocally(notification.id);
      if (!notification.readAt) {
        setUnreadCount((current) => Math.max(current - 1, 0));
      }
      trackCatCareEvent("catcare_notification_opened", {
        notification_kind: notification.eventType,
        status: result.data.href ? "available" : "unavailable",
        surface: "owner"
      });

      if (result.data.href) {
        setIsOpen(false);
        router.push(result.data.href);
      }
    });
  }

  function markAllRead(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await markAllOwnerNotificationsReadAction();

      if (!result.ok) {
        setError(labels.actionError);
        return;
      }

      const readAt = new Date().toISOString();
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, readAt }))
      );
      setUnreadCount(0);
      trackCatCareEvent("catcare_notifications_marked_read", {
        status: "success",
        surface: "owner"
      });
    });
  }

  function markReadLocally(notificationId: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId && !notification.readAt
          ? { ...notification, readAt: new Date().toISOString() }
          : notification
      )
    );
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={
          unreadCount > 0
            ? `${labels.open}，${unreadCount} ${labels.unreadSuffix}`
            : labels.open
        }
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        onClick={toggleCenter}
        ref={triggerRef}
        type="button"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <section
          aria-label={labels.title}
          className="fixed inset-x-4 top-[4.5rem] z-50 w-auto overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 sm:absolute sm:inset-x-auto sm:right-0 sm:top-14 sm:w-[min(24rem,calc(100vw-2rem))]"
          ref={panelRef}
          role="dialog"
          tabIndex={-1}
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                {labels.title}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {unreadCount > 0
                  ? `${unreadCount} ${labels.unreadSuffix}`
                  : labels.allRead}
              </p>
            </div>
            {unreadCount > 0 ? (
              <button
                className="shrink-0 rounded-full px-3 py-2 text-xs font-semibold text-teal-700 transition hover:bg-teal-50 disabled:cursor-wait disabled:opacity-60"
                disabled={pending}
                onClick={markAllRead}
                type="button"
              >
                {pending ? labels.processing : labels.markAllRead}
              </button>
            ) : null}
          </div>

          {center.status === "error" ? (
            <p className="px-4 py-6 text-sm leading-6 text-rose-700">
              {labels.loadError}
            </p>
          ) : notifications.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-semibold text-slate-800">
                {labels.emptyTitle}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {labels.emptyDescription}
              </p>
            </div>
          ) : (
            <div className="max-h-[min(32rem,65vh)] overflow-y-auto">
              {notifications.map((notification) => {
                const isUnread = !notification.readAt;
                const isException = notification.eventType === "care_exception";
                return (
                  <button
                    className={`block w-full border-b border-slate-100 px-4 py-4 text-left transition last:border-b-0 disabled:cursor-wait ${
                      isException
                        ? `border-l-4 border-l-amber-500 hover:bg-amber-100/70 ${
                            isUnread ? "bg-amber-100/60" : "bg-amber-50/60"
                          }`
                        : isUnread
                          ? "bg-[#f3fbf8] hover:bg-teal-50/70"
                          : "bg-white hover:bg-teal-50/70"
                    }`}
                    disabled={pending}
                    key={notification.id}
                    onClick={() => openNotification(notification)}
                    type="button"
                  >
                    <span className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                          isException
                            ? isUnread
                              ? "bg-amber-600"
                              : "bg-slate-300"
                            : isUnread
                              ? "bg-teal-600"
                              : "bg-slate-200"
                        }`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-3">
                          <span
                            className={`font-semibold ${
                              "text-slate-950"
                            }`}
                          >
                            {isException
                              ? labels.exceptionTitle
                              : labels.submissionTitle}
                          </span>
                          <span className="shrink-0 text-xs text-slate-400">
                            {formatNotificationTime(notification.notifiedAt, locale)}
                          </span>
                        </span>
                        {isException ? (
                          <span className="mt-2 inline-flex rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800">
                            {labels.exceptionBadge}
                          </span>
                        ) : null}
                        <span className="mt-1 block break-words text-sm font-medium text-slate-700">
                          {notification.taskTitle}
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                          {notification.serviceDate} · {notification.visitTime}
                        </span>
                        {!notification.href ? (
                          <span className="mt-2 block text-xs font-medium text-amber-700">
                            {labels.targetUnavailable}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {error ? (
            <p className="border-t border-rose-100 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
              {error}
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function formatNotificationTime(value: string, locale: Locale) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric"
  }).format(date);
}
