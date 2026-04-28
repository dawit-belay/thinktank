"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Bell, Users, CalendarDays, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { markNotificationRead, markAllNotificationsRead } from "@/app/actions";

export type NotificationData = {
  id: string;
  type: "group_invite" | "meeting_invite";
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
};

type Props = {
  initialNotifications: NotificationData[];
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationBell({ initialNotifications }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const unread = initialNotifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleOpen() {
    setOpen((v) => !v);
  }

  function handleNotificationClick(n: NotificationData) {
    setOpen(false);
    if (!n.isRead) {
      startTransition(async () => {
        await markNotificationRead(n.id);
        router.refresh();
      });
    }
    router.push(n.link);
  }

  function handleMarkAll() {
    startTransition(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={handleOpen}
        className="relative rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/60">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
            <p className="text-sm font-bold text-zinc-900">Notifications</p>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                disabled={isPending}
                className="flex items-center gap-1 text-xs font-medium text-zinc-400 transition hover:text-emerald-600 disabled:opacity-40"
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {initialNotifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-zinc-400">
                No notifications yet.
              </p>
            ) : (
              initialNotifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-zinc-50 ${
                    !n.isRead ? "bg-emerald-50/60" : ""
                  }`}
                >
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    n.type === "group_invite"
                      ? "bg-violet-100 text-violet-600"
                      : "bg-sky-100 text-sky-600"
                  }`}>
                    {n.type === "group_invite" ? (
                      <Users size={13} />
                    ) : (
                      <CalendarDays size={13} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm leading-snug ${!n.isRead ? "font-semibold text-zinc-900" : "text-zinc-600"}`}>
                      {n.message}
                    </p>
                    <p className="mt-0.5 text-[11px] text-zinc-400">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
