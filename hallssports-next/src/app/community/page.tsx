"use client";

import { useEffect, useState, useRef, useMemo, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, Shield, AlertCircle, Loader2, RefreshCw, Trophy } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/GlassCard";
import { PageShell } from "@/components/PageShell";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { StatusBadge, TeamLogo, type MatchStatus } from "@/components/StatusBadge";
import { BackButton } from "@/components/BackButton";
import { formatDistanceToNow } from "date-fns";
import { useChatRealtime } from "@/hooks/useChatRealtime";
import type { MatchChat, Match, MatchEvent } from "@/lib/queries";
import { FanClubGate } from "@/components/FanClubGate";

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
  
  const [activeMatch, setActiveMatch] = useState<{ match_id: string; match_name: string } | null>(null);
  const [showGate, setShowGate] = useState(false);
  
  const [matchId, setMatchId] = useState<string | null>(null);
  const [matchInfo, setMatchInfo] = useState<{
    id: string;
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
  const [celebration, setCelebration] = useState<{ active: boolean; text: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial gate check
  useEffect(() => {
    const stored = localStorage.getItem("hallssports_active_match");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setActiveMatch(parsed);
        setMatchId(parsed.match_id);
      } catch {
        setShowGate(true);
      }
    } else {
      setShowGate(true);
    }
  }, []);

  // When matchId is set, fetch match details
  useEffect(() => {
    if (!matchId) return;

    const fetchMatch = async () => {
      try {
        const res = await fetch(`/api/live-score?matchId=${matchId}`);
        if (!res.ok) throw new Error("Failed to fetch match");
        const data = await res.json();
        
        setMatchInfo(data);
        setLoading(false);
      } catch (e) {
        console.error("Failed to load match", e);
        setError("Match not found or no longer active");
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  // Fetch initial messages
  const [initialMessages, setInitialMessages] = useState<MatchChat[]>([]);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat?matchId=${matchId}`);
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data: MatchChat[] = await res.json();
        setInitialMessages(data.reverse());
      } catch (e) {
        setMessagesError(e instanceof Error ? e.message : "Failed to load messages");
      }
    };

    fetchMessages();
  }, [matchId]);

  const handleGoal = useCallback((event: any) => {
    setCelebration({
      active: true,
      text: `⚽ GOAL! ${event.player_name} scores for ${event.team}!`
    });
    
    setTimeout(() => setCelebration(null), 8000);
  }, []);

  const { messages, isPolling } = useChatRealtime(
    matchId || "",
    initialMessages,
    handleGoal
  );

  const handleGateSelect = (selection: { match_id: string; match_name: string }) => {
    setActiveMatch(selection);
    setMatchId(selection.match_id);
    setShowGate(false);
    setLoading(true);
  };

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

  const storedUsername = getUsername();
  useEffect(() => {
    if (!storedUsername && !showGate) {
      requestAnimationFrame(() => setShowUsernameGate(true));
    }
  }, [storedUsername, showGate]);

  const isChatLocked =
    !matchInfo || matchInfo.status === "scheduled" || matchInfo.status === "finished";

  const groupedMessages = useMemo(() => groupMessages(messages), [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (showGate) {
    return <FanClubGate onSelect={handleGateSelect} />;
  }

  if (loading || !matchId) {
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
            onClick={() => setShowGate(true)}
            className="text-primary underline"
          >
            Choose another match
          </button>
        </GlassCard>
      </PageShell>
    );
  }

  return (
    <PageShell title="Community">
      <BackButton />
      <AnimatePresence>
        {celebration && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] glass-strong px-6 py-3 rounded-full border-primary/50 shadow-[0_0_20px_rgba(0,168,89,0.4)] flex items-center gap-3"
          >
            <span className="text-xl">🎉</span>
            <span className="font-bold text-primary">{celebration.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

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
        <GlassCard className={`p-4 transition-all duration-500 ${celebration ? "border-primary shadow-[0_0_15px_rgba(0,168,89,0.3)]" : ""}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TeamLogo
                name={(matchInfo.home_team || "UNK").substring(0, 3)}
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
            <div className="flex flex-col items-end gap-1">
              <StatusBadge status={matchInfo.status} minute={matchInfo.minute} isPolling={isPolling} />
              <button onClick={() => setShowGate(true)} className="text-[10px] text-primary hover:underline">Change match</button>
            </div>
          </div>
          <div className="text-center mt-3 text-2xl font-bold">
            <motion.span
              animate={celebration ? { scale: [1, 1.3, 1], color: ["#fff", "#00A859", "#fff"] } : {}}
              transition={{ duration: 0.5, repeat: celebration ? 2 : 0 }}
            >
              {matchInfo.home_score ?? 0} : {matchInfo.away_score ?? 0}
            </motion.span>
          </div>
        </GlassCard>

        {/* Status Info */}
        <div className="text-center text-xs text-muted-foreground">
          Follow {activeMatch?.match_name}. Support your club!
        </div>

        {/* Chat Area */}
        <GlassCard className={`p-4 h-[500px] flex flex-col transition-all duration-500 ${celebration ? "ring-2 ring-primary/50" : ""}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h3 className="font-bold">Community Chat</h3>
            </div>
            {isPolling && (
              <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
          </div>

          {isChatLocked ? (
            <div className="flex-1 flex flex-col items-center justify-center p-3 bg-muted/10 rounded-lg text-center">
              <Shield className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {matchInfo.status === "scheduled"
                  ? "Chat will open when match kicks off"
                  : "Chat closed - Match has finished"}
              </p>
              <button onClick={() => setShowGate(true)} className="mt-4 text-primary text-sm font-bold">Try another match</button>
            </div>
          ) : messagesError ? (
            <div className="flex-1 flex flex-col items-center justify-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
              <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
              <p className="text-sm text-red-400">
                Chat temporarily unavailable.
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8">
              <MessageCircle className="h-16 w-16 text-primary/20 mb-2" />
              <p className="text-muted-foreground">
                No messages yet. Be the first to comment!
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
              {groupedMessages.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-2">
                  {group.map((msg) => (
                    <motion.div 
                      key={msg.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass rounded-2xl p-3 max-w-[85%]"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-primary text-xs">
                          {msg.user_name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(msg.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                    </motion.div>
                  ))}
                </div>
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
              placeholder={isChatLocked ? "Chat is locked" : "Message community..."}
              disabled={isChatLocked || isSending}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white/10 focus:border-primary/50 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isChatLocked || isSending}
              className="p-3 bg-primary text-white rounded-xl disabled:opacity-50 disabled:bg-white/10 transition-all shadow-lg shadow-primary/20 active:scale-95"
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