"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getRealtimeConnectionDelay } from "@/lib/realtimeDelay";

type ConnectionStatus = "idle" | "connecting" | "connected" | "disconnected" | "polling";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  verified: boolean;
}

interface UseAnnouncementsRealtimeResult {
  status: ConnectionStatus;
  isPolling: boolean;
}

export function useAnnouncementsRealtime(
  onAnnouncement: (announcement: Announcement) => void
): UseAnnouncementsRealtimeResult {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [isPolling, setIsPolling] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const connectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const disconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSeenIdRef = useRef<string | null>(null);
  const isMounted = useRef(true);
  const connectRef = useRef<(() => void) | null>(null);
  const startPollingRef = useRef<(() => void) | null>(null);
  const statusRef = useRef<ConnectionStatus>("idle");

  // Sync status ref
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const clearAllTimers = useCallback(() => {
    if (connectTimerRef.current) clearTimeout(connectTimerRef.current);
    if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
    if (reconnectTimerRef.current) clearInterval(reconnectTimerRef.current);
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
  }, []);

  const connect = useCallback(() => {
    if (!supabase) {
      setStatus("disconnected");
      return;
    }

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    clearAllTimers();
    setIsPolling(false);
    setStatus("connecting");

    const channel = supabase
      .channel("announcements-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "announcements",
          filter: "verified=eq.true",
        },
        (payload: { new: Announcement }) => {
          const ann = payload.new;
          const id = ann.id;
          if (!lastSeenIdRef.current || id > lastSeenIdRef.current) {
            lastSeenIdRef.current = id;
          }
          onAnnouncement(ann);
        }
      )
      .subscribe((status, error) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(connectTimerRef.current!);
          setStatus("connected");
        } else if (error) {
          setStatus("disconnected");
          clearTimeout(connectTimerRef.current!);
          disconnectTimerRef.current = setTimeout(() => {
            startPollingRef.current?.();
          }, 10000);
        }
      });

    channelRef.current = channel;

    connectTimerRef.current = setTimeout(() => {
      if (statusRef.current === "connecting") {
        setStatus("disconnected");
        clearTimeout(connectTimerRef.current!);
        disconnectTimerRef.current = setTimeout(() => {
          startPollingRef.current?.();
        }, 10000);
      }
    }, 5000);
  }, [onAnnouncement, clearAllTimers]);

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/announcements");
      if (!res.ok) throw new Error(`Poll error: ${res.status}`);
      const data: Announcement[] = await res.json();

      if (lastSeenIdRef.current) {
        const latestId = lastSeenIdRef.current;
        const newAnnouncements = data.filter(
          (a) => a.id > latestId
        );
        newAnnouncements.forEach((ann) => {
          const id = ann.id;
          if (id > lastSeenIdRef.current!) {
            lastSeenIdRef.current = id;
          }
          onAnnouncement(ann);
        });
      }
    } catch (err) {
      console.error("Announcements poll failed:", err);
    }
  }, [onAnnouncement]);

  const startPolling = useCallback(() => {
    setIsPolling(true);
    setStatus("polling");

    poll();

    pollingTimerRef.current = setInterval(poll, 60_000);

    reconnectTimerRef.current = setInterval(() => {
      connectRef.current?.();
    }, 120_000);
  }, [poll]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    if (reconnectTimerRef.current) clearInterval(reconnectTimerRef.current);
  }, []);

  // Store refs to latest callbacks
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    startPollingRef.current = startPolling;
  }, [startPolling]);

  // Visibility
  useEffect(() => {
    const handleVisibility = () => {
      if (!document) return;
      if (document.hidden) {
        if (channelRef.current) {
          supabase?.removeChannel(channelRef.current);
          channelRef.current = null;
        }
        stopPolling();
      } else {
        connectRef.current?.();
        poll();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [stopPolling, poll]);

  // Initial connection with staggered delay
  useEffect(() => {
    const delay = getRealtimeConnectionDelay();
    const timer = setTimeout(() => {
      if (isMounted.current) {
        connectRef.current?.();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      clearAllTimers();
      if (channelRef.current) {
        supabase?.removeChannel(channelRef.current);
      }
    };
  }, [clearAllTimers]);

  return { status, isPolling };
}
