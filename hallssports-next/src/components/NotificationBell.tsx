"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { ErrorState } from "@/components/ErrorState";
import { Bell } from "lucide-react";
import { useAnnouncementsRealtime } from "@/hooks/useAnnouncementsRealtime";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  verified: boolean;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Announcement[]>([]);
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial announcements from API
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch("/api/announcements");
        if (!res.ok) throw new Error("Failed to fetch announcements");
        const data: Announcement[] = await res.json();
        setNotifications(data);
        setCount(
          data.filter((n) => !localStorage.getItem(`hallssports_notif_read_${n.id}`))
            .length
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load announcements");
      }
    };

    fetchAnnouncements();
  }, []);

  // Handle new announcement from realtime (or polling fallback)
  const handleNewAnnouncement = (announcement: Announcement) => {
    setNotifications((prev) => [announcement, ...prev.slice(0, 2)]);
    setCount((c) => c + 1);
  };

  const { isPolling } = useAnnouncementsRealtime(handleNewAnnouncement);

  const markRead = (id: string) => {
    localStorage.setItem(`hallssports_notif_read_${id}`, "true");
    setCount((c) => Math.max(0, c - 1));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg glass hover:bg-white/20 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {count}
          </span>
        )}
        {isPolling && (
          <span
            className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-gray-400"
            title="Updates delayed"
          />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 z-50"
          >
            <GlassCard className="p-0 max-h-96 overflow-y-auto">
               {error ? (
                 <div className="p-4">
                   <ErrorState
                     message={error}
                     onRetry={() => window.location.reload()}
                   />
                 </div>
               ) : notifications.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">
                  No notifications yet
                </p>
              ) : (
                <div>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 border-b border-white/10 last:border-0 hover:bg-white/10 cursor-pointer"
                      onClick={() => markRead(n.id)}
                    >
                      <p className="font-bold text-sm">{n.title}</p>
                       <p className="text-xs text-muted-foreground mt-1">
                         {n.content}
                       </p>
                      <p className="text-xs text-primary mt-1">
                        {new Date(n.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}