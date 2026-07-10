"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Bell, Check } from "lucide-react";

interface Notification {
  _id: string;
  type: string;
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
}

const activityIcons: Record<string, string> = {
  project_created:   "📁",
  project_updated:   "✏️",
  project_deleted:   "🗑️",
  skill_created:     "⚡",
  skill_updated:     "✏️",
  skill_deleted:     "🗑️",
  portfolio_updated: "👤",
  category_created:  "🏷️",
  category_updated:  "✏️",
  category_deleted:  "🗑️",
  image_uploaded:    "🖼️",
};

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function NotificationBell({ dark = true }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.notifications ?? []);
      setUnread(data.unreadCount ?? 0);
    } catch {
      /* silent — notifications are non-critical */
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const toggleOpen = () => {
    setOpen((o) => !o);
    if (!open) load();
  };

  const markAllRead = async () => {
    if (unread === 0) return;
    setLoading(true);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    try {
      await fetch("/api/notifications", { method: "PATCH" });
    } finally {
      setLoading(false);
    }
  };

  const markOneRead = async (id: string) => {
    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleOpen}
        className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 ${
          dark
            ? "text-[#666] hover:bg-void-2 hover:text-white"
            : "text-white/80 hover:bg-white/10 hover:text-white"
        }`}
        aria-label="Notifications"
      >
        <Bell size={18} strokeWidth={2} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-lime text-ink text-[9px] font-black flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 max-w-[90vw] bg-white border border-edge rounded-2xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-edge">
            <p className="text-ink font-semibold text-sm">Notifications</p>
            <button
              onClick={markAllRead}
              disabled={loading || unread === 0}
              className="text-2xs font-semibold text-ink-3 hover:text-ink flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check size={12} strokeWidth={2.5} /> Mark all read
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-edge">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-ink-3 text-sm">You&apos;re all caught up.</p>
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n._id}
                  onClick={() => !n.read && markOneRead(n._id)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-canvas ${
                    !n.read ? "bg-lime/10" : ""
                  }`}
                >
                  <span className="text-base shrink-0 mt-0.5">{activityIcons[n.type] ?? "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-ink text-xs font-semibold truncate">{n.title}</p>
                    {n.description && (
                      <p className="text-ink-3 text-2xs mt-0.5 truncate">{n.description}</p>
                    )}
                    <p className="text-ink-3 text-2xs mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-lime-dim mt-1.5 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
