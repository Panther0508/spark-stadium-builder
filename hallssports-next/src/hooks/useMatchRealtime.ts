"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getRealtimeConnectionDelay } from "@/lib/realtimeDelay";
import type { Match, MatchEvent } from "@/lib/queries";

type ConnectionStatus = "idle" | "connecting" | "connected" | "disconnected" | "polling";

interface UseMatchRealtimeResult {
  match: Match | null;
  events: MatchEvent[];
  status: ConnectionStatus;
  isPolling: boolean;
  error: Error | null;
}

export function useMatchRealtime(
  initialMatch: Match | null,
  initialEvents: MatchEvent[]
): UseMatchRealtimeResult {
  const [match, setMatch] = useState<Match | null>(initialMatch);
  const [events, setEvents] = useState<MatchEvent[]>(initialEvents);
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const connectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const disconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);
  const connectRef = useRef<(() => void) | null>(null);
  const startPollingRef = useRef<(() => void) | null>(null);
  const statusRef = useRef<ConnectionStatus>("idle");

  // Sync status ref
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const matchId = initialMatch?.id ?? "";

  const clearAllTimers = useCallback(() => {
    if (connectTimerRef.current) clearTimeout(connectTimerRef.current);
    if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
    if (reconnectTimerRef.current) clearInterval(reconnectTimerRef.current);
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
  }, []);

  const connect = useCallback(() => {
    if (!supabase || !matchId) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    clearAllTimers();
    setIsPolling(false);
    setStatus("connecting");
    setError(null);

    const channel = supabase
      .channel(`match-${matchId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${matchId}` },
        (payload: { new: Match }) => {
          const newEvent = payload.new as unknown as MatchEvent;
          setEvents((prev) => [newEvent, ...prev]);
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(connectTimerRef.current!);
          setStatus("connected");
        } else if (err) {
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
  }, [matchId, clearAllTimers]);

  const poll = useCallback(async () => {
    if (!matchId) return;
    try {
      const res = await fetch(`/api/live-score?matchId=${matchId}&includeEvents=true`);
      if (!res.ok) throw new Error(`Poll error: ${res.status}`);
      const json = await res.json();

      if (json.match && !json.match.error) {
        setMatch(json.match);
      }
      if (json.events && !json.events.error) {
        setEvents(json.events);
      }
    } catch {
      // ignore
    }
  }, [matchId]);

  const startPolling = useCallback(() => {
    setIsPolling(true);
    setStatus("polling");

    poll();

    pollingTimerRef.current = setInterval(poll, 25_000);

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

  return { match, events, status, isPolling, error };
}
