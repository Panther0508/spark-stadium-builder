"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getRealtimeConnectionDelay } from "@/lib/realtimeDelay";
import type { MatchChat, MatchEvent } from "@/lib/queries";

type ConnectionStatus = "idle" | "connecting" | "connected" | "disconnected" | "polling";

interface UseChatRealtimeResult {
  messages: MatchChat[];
  status: ConnectionStatus;
  isPolling: boolean;
  error: Error | null;
}

export function useChatRealtime(
  matchId: string,
  initialMessages: MatchChat[],
  onGoal?: (event: MatchEvent) => void
): UseChatRealtimeResult {
  const [messages, setMessages] = useState<MatchChat[]>(initialMessages);
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const connectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const disconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const isMounted = useRef(true);
  const connectRef = useRef<(() => void) | null>(null);
  const startPollingRef = useRef<(() => void) | null>(null);
  const statusRef = useRef<ConnectionStatus>("idle");

  // Sync status ref
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Initialize known IDs from initial messages
  useEffect(() => {
    knownIdsRef.current = new Set(initialMessages.map((m) => m.id));
  }, [initialMessages]);

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
      .channel(`chat-${matchId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "match_chats", filter: `match_id=eq.${matchId}` },
        (payload: { new: MatchChat }) => {
          const newMsg = payload.new;
          setMessages((prev) => {
            const updated = [newMsg, ...prev];
            if (updated.length > 20) {
              updated.pop();
            }
            return updated;
          });
          knownIdsRef.current.add(newMsg.id);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "match_events", filter: `match_id=eq.${matchId}` },
        (payload: { new: MatchEvent }) => {
          if (payload.new.type === 'goal' && onGoal) {
            onGoal(payload.new);
          }
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
  }, [matchId, clearAllTimers, onGoal]);

  const poll = useCallback(async () => {
    if (!matchId) return;
    try {
      const res = await fetch(`/api/chat?matchId=${matchId}`);
      if (!res.ok) throw new Error(`Poll error: ${res.status}`);
      const data: MatchChat[] = await res.json();

      setMessages((prev) => {
        const allMap = new Map<string, MatchChat>();
        data.forEach((msg) => {
          if (!allMap.has(msg.id)) {
            allMap.set(msg.id, msg);
          }
        });
        prev.forEach((msg) => {
          if (!allMap.has(msg.id)) {
            allMap.set(msg.id, msg);
          }
        });
        const combined = Array.from(allMap.values()).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        if (combined.length > 20) {
          combined.splice(20);
        }
        return combined;
      });
    } catch (err) {
      console.error("Chat poll failed:", err);
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

  // Initial delayed connection
  useEffect(() => {
    const delay = getRealtimeConnectionDelay();
    const timer = setTimeout(() => {
      if (isMounted.current) {
        connectRef.current?.();
      }
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  // Cleanup
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

  return { messages, status, isPolling, error };
}
