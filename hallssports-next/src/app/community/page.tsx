"use client";

import { useEffect, useState, useRef, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, Shield, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/GlassCard";
import { PageShell } from "@/components/PageShell";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { StatusBadge, TeamLogo, type MatchStatus } from "@/components/StatusBadge";
import { formatDistanceToNow } from "date-fns";
import { useChatRealtime } from "@/hooks/useChatRealtime";
import type { MatchChat, Match } from "@/lib/queries";

const BLACKLIST = ["spam", "scam", "idiot", "stupid"];

function getUsername(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("hallssports_username");
  }
  return null;
}

function setUsername(name: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("hallssports_username", name);
  }
}

function moderateMessage(message: string): { allowed: boolean; reason?: string } {
  const lower = message.toLowerCase();
  if (lower.includes("http") || lower.includes("www.") || lower.includes(".com")) {
    return { allowed: false, reason: "Links are not allowed" };
  }
  for (const word of BLACKLIST) {
    if (lower.includes(word)) {
      return { allowed: false, reason: "Message violates community guidelines" };
    }
  }
  return { allowed: true };
}

function groupMessages(messages: MatchChat[]): MatchChat[][] {
  const groups: MatchChat[][] = [];
  let currentGroup: MatchChat[] = [];
  let lastTime = 0;

  messages.forEach((msg) => {
    const msgTime = new Date(msg.created_at).getTime();
    if (currentGroup.length === 0 || msgTime - lastTime > 5 * 60 * 1000) {
      if (currentGroup.length > 0) groups.push(currentGroup);
      currentGroup = [msg];
    } else {
      currentGroup.push(msg);
    }
    lastTime = msgTime;
  });
  if (currentGroup.length > 0) groups.push(currentGroup);
  return groups;
}

function CommunityContent() {
  const searchParams = useSearchParams();
  const paramMatchId = searchParams.get("matchId");
  const [matchId, setMatchId] = useState<string | null>(paramMatchId);
  const [matchInfo, setMatchInfo] = useState<{
    home_team: string;
    away_team: string;
    venue?: string;
    status: MatchStatus;
    home_score?: number;
    away_score?: number;
    minute?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUsernameGate, setShowUsernameGate] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [isDev] = useState(process.env.NODE_ENV === "development");
  const [mockMatchStatus, setMockMatchStatus] = useState<"scheduled" | "live" | "finished">("live");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const storedUsername = getUsername();
  useEffect(() => {
    if (!storedUsername) {
      requestAnimationFrame(() => setShowUsernameGate(true));
    }
  }, [storedUsername]);

  // Determine matchId from query param or fetch live match
  useEffect(() => {
    if (paramMatchId) {
      // Use microtask to avoid setState-in-effect rule
      queueMicrotask(() => setMatchId(paramMatchId));
      return;
    }

    // Fetch matches to pick a live one
    const fetchMatches = async () => {
      try {
        const res = await fetch("/api/matches");
        if (!res.ok) throw new Error("Failed to fetch matches");
        const matches: Match[] = await res.json();
        // Prefer live, then scheduled, then any
        const selected = (
          matches.find((m) => m.status === "live") ||
          matches.find((m) => m.status === "scheduled") ||
          matches[0]
        );
        if (selected) {
          setMatchId(selected.id);
        } else {
          setError("No matches available");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to get match");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [paramMatchId]);

  // When matchId is set, fetch match details
  useEffect(() => {
    if (!matchId) return;

    const fetchMatch = async () => {
      try {
        const res = await fetch(`/api/live-score?matchId=${matchId}`);
        if (!res.ok) throw new Error("Failed to fetch match");
        const data = await res.json();
        setMatchInfo(data);
      } catch (e) {
        console.error("Failed to load match", e);
      }
    };

    fetchMatch();
  }, [matchId]);

  // Fetch initial messages for this matchId (not using hook yet because we need to pass initial messages)
  const [initialMessages, setInitialMessages] = useState<MatchChat[]>([]);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat?matchId=${matchId}`);
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data: MatchChat[] = await res.json();
        // API returns descending (newest first). Reverse to chronological order for UI.
        setInitialMessages(data.reverse());
      } catch (e) {
        setMessagesError(e instanceof Error ? e.message : "Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [matchId]);

  const { messages, isPolling } = useChatRealtime(
    matchId || "",
    initialMessages
  );

  // Combine loading states
  const isLoading = loading || !matchId;

  const handleUsernameSubmit = () => {
    const trimmed = usernameInput.trim();
    if (trimmed.length < 3 || trimmed.length > 20) {
      toast.error("Username must be 3-20 characters");
      return;
    }
    setUsername(trimmed);
    setShowUsernameGate(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchId || !newMessage.trim()) return;

    const moderation = moderateMessage(newMessage);
    if (!moderation.allowed) {
      setModerationError(moderation.reason || "Message blocked");
      toast.error(moderation.reason || "Message blocked");
      return;
    }

    setIsSending(true);
    setModerationError(null);

    try {
      const storedUsername = getUsername() || "Anonymous Fan";
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_id: matchId,
          user_name: storedUsername,
          message: newMessage.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send message');
      }

      setNewMessage("");
    } catch (err: unknown) {
      toast.error("Failed to send message");
      const message = err instanceof Error ? err.message : "Send failed";
      setModerationError(message);
    } finally {
      setIsSending(false);
    }
  };

  const isChatLocked =
    !matchInfo || matchInfo.status === "scheduled" || matchInfo.status === "finished";

  const groupedMessages = useMemo(() => groupMessages(messages), [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <PageShell title="Community">
        <ShimmerLoader height={500} width="100%" />
      </PageShell>
    );
  }

  if (error || !matchInfo) {
    return (
      <PageShell title="Community">
        <GlassCard className="p-6 text-center">
          <p className="text-red-400 mb-2">Error: {error || "Match not found"}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-primary underline"
          >
            Retry
          </button>
        </GlassCard>
      </PageShell>
    );
  }

  return (
    <PageShell title="Community">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        {/* Username Gate Modal */}
        <AnimatePresence>
          {showUsernameGate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass rounded-2xl p-6 max-w-sm w-full"
              >
                <h3 className="text-xl font-bold mb-2">Join the Chat</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose a display name to enter the discussion.
                </p>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Enter username (3-20 chars)"
                  className="w-full bg-white/10 rounded-lg px-3 py-2 mb-4 outline-none focus:bg-white/20"
                  maxLength={20}
                />
                <button
                  onClick={handleUsernameSubmit}
                  className="w-full py-2 bg-primary text-white rounded-lg font-medium"
                >
                  Enter Chat
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Match Header */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TeamLogo
                name={matchInfo.home_team.substring(0, 3)}
                color="#00A859"
              />
              <div>
                <h3 className="font-bold">
                  {matchInfo.home_team} vs {matchInfo.away_team}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {matchInfo.venue || "Halls Stadium"}
                </p>
              </div>
            </div>
            <StatusBadge status={matchInfo.status} minute={matchInfo.minute} isPolling={isPolling} />
          </div>
          <div className="text-center mt-3 text-2xl font-bold">
            {matchInfo.home_score ?? 0} : {matchInfo.away_score ?? 0}
          </div>
          {isPolling && (
            <div className="mt-2 text-center">
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Updates are delayed
              </span>
            </div>
          )}
        </GlassCard>

        {/* Dev Toggle Button */}
        {isDev && (
          <div className="flex justify-center">
            <button
              onClick={() => {
                setMockMatchStatus((prev) => {
                  if (prev === "scheduled") return "live";
                  if (prev === "live") return "finished";
                  return "scheduled";
                });
              }}
              className="px-3 py-1 text-xs bg-primary/20 rounded-lg"
            >
              Toggle Match Status ({mockMatchStatus})
            </button>
          </div>
        )}

        {/* Status Info */}
        <div className="text-center text-xs text-muted-foreground">
          Messages are kept for 24 hours after full-time.
        </div>

        {/* Chat Area */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h3 className="font-bold">Match Chat</h3>
          </div>

          {isChatLocked ? (
            <div className="mb-4 p-3 bg-muted/30 rounded-lg text-center">
              <Shield className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-sm text-muted-foreground">
                {matchInfo.status === "scheduled"
                  ? "Chat will open when match kicks off"
                  : "Chat closed - Match has finished"}
              </p>
            </div>
          ) : messagesError ? (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-center">
              <AlertCircle className="h-5 w-5 text-red-400 mx-auto mb-1" />
              <p className="text-sm text-red-400">
                Chat temporarily unavailable.
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-primary/30 mx-auto mb-2" />
              <p className="text-muted-foreground">
                No messages yet. Be the first to comment!
              </p>
            </div>
          ) : (
            <div className="h-[300px] overflow-y-auto mb-4 space-y-3 pr-2">
              {groupedMessages.map((group, groupIndex) => (
                <motion.div
                  key={groupIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: groupIndex * 0.05 }}
                  className="space-y-2"
                >
                  {group.map((msg) => (
                    <div key={msg.id} className="glass rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-primary text-sm">
                          {msg.user_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(msg.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  ))}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Moderation Error */}
          <AnimatePresence>
            {moderationError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 p-3 bg-red-500/20 border border-red-500/40 rounded-lg flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-400">{moderationError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Composer */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isChatLocked ? "Chat is locked" : "Type a message..."}
              disabled={isChatLocked || isSending}
              className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white/20 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isChatLocked || isSending}
              className="p-2 text-primary disabled:opacity-50"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
        </GlassCard>
      </motion.div>
    </PageShell>
  );
}

export default function CommunityPage() {
  return (
    <Suspense fallback={<PageShell title="Community"><ShimmerLoader height={500} width="100%" /></PageShell>}>
      <CommunityContent />
    </Suspense>
  );
}