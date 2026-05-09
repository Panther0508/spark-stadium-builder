"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { PageShell } from "@/components/PageShell";
import { StatusBadge, TeamLogo } from "@/components/StatusBadge";
import { Activity, Clock, Share2 } from "lucide-react";

const MOCK_LIVE_MATCHES = [
  {
    id: "live1",
    home_team: "Rangers FC",
    away_team: "Panthers United",
    home_score: 2,
    away_score: 2,
    status: "live" as const,
    minute: 67,
    venue: "Halls Stadium",
    events: [
      { id: 1, type: "goal", minute: 12, team: "home", player: "James Wilson", assist: "Mike Johnson" },
      { id: 2, type: "yellow_card", minute: 23, team: "away", player: "Tom Davis" },
      { id: 3, type: "goal", minute: 34, team: "away", player: "Alex Smith", assist: "Chris Brown" },
      { id: 4, type: "substitution", minute: 45, team: "home", player_out: "Sam Taylor", player_in: "Rob Lee" },
      { id: 5, type: "goal", minute: 52, team: "home", player: "James Wilson", assist: "Dan Miller" },
      { id: 6, type: "red_card", minute: 58, team: "away", player: "Tom Davis" },
      { id: 7, type: "goal", minute: 65, team: "away", player: "Alex Smith", assist: "Pat King" },
      { id: 8, type: "substitution", minute: 66, team: "away", player_out: "Chris Brown", player_in: "Matt White" },
    ],
  },
  {
    id: "live2",
    home_team: "Thunder Wolves",
    away_team: "City Eagles",
    home_score: 1,
    away_score: 0,
    status: "live" as const,
    minute: 23,
    venue: "North Field",
    events: [
      { id: 1, type: "goal", minute: 8, team: "home", player: "Luke Adams", assist: "Tom Clark" },
      { id: 2, type: "yellow_card", minute: 15, team: "home", player: "Mark Evans" },
    ],
  },
  {
    id: "live3",
    home_team: "Royal FC",
    away_team: "United Stars",
    home_score: 0,
    away_score: 0,
    status: "half-time" as const,
    minute: 45,
    venue: "South Stadium",
    events: [
      { id: 1, type: "yellow_card", minute: 22, team: "away", player: "Ben Hall" },
      { id: 2, type: "substitution", minute: 45, team: "home", player_out: "Tim Green", player_in: "Nick Black" },
    ],
  },
];

type MatchEvent = {
  id: number;
  type: "goal" | "yellow_card" | "red_card" | "substitution";
  minute: number;
  team: "home" | "away";
  player?: string;
  assist?: string;
  player_out?: string;
  player_in?: string;
} | {
  id: number;
  type: "goal";
  minute: number;
  team: "home" | "away";
  player: string;
  assist?: string;
  player_out?: undefined;
  player_in?: undefined;
};

type LiveMatch = typeof MOCK_LIVE_MATCHES[0];

function getEventIcon(type: MatchEvent["type"]) {
  switch (type) {
    case "goal": return "⚽";
    case "yellow_card": return "🟨";
    case "red_card": return "🟥";
    case "substitution": return "🔄";
    default: return "•";
  }
}

function getEventText(event: MatchEvent, match: LiveMatch) {
  const team = event.team === "home" ? match.home_team : match.away_team;
  switch (event.type) {
    case "goal":
      return `${event.player} scores for ${team}${event.assist ? ` (assist: ${event.assist})` : ""}`;
    case "yellow_card":
      return `${event.player} (${team}) receives a yellow card`;
    case "red_card":
      return `${event.player} (${team}) is sent off!`;
    case "substitution":
      return `${event.player_in} replaces ${event.player_out} for ${team}`;
    default: return "";
  }
}

export default function LiveStatsPage() {
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [activeMatchId, setActiveMatchId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [simulatingGoal, setSimulatingGoal] = useState(false);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 700));
        setLiveMatches(MOCK_LIVE_MATCHES);
        setActiveMatchId(MOCK_LIVE_MATCHES[0].id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load live matches");
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const activeMatch = liveMatches.find(m => m.id === activeMatchId);

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const simulateGoal = () => {
    setSimulatingGoal(true);
    triggerConfetti();
    const newEvent = {
      id: Date.now(),
      type: "goal" as const,
      minute: (activeMatch?.minute || 0) + 1,
      team: "home" as const,
      player: "Simulated Player",
      assist: "Sim Assistant",
    };
    setLiveMatches(prev =>
      prev.map(m =>
        m.id === activeMatchId
          ? {
              ...m,
              events: [...m.events, newEvent],
              home_score: m.home_score + 1,
            }
          : m
      )
    );
    setTimeout(() => setSimulatingGoal(false), 3000);
  };

  if (loading) {
    return (
      <PageShell title="Live Stats">
        <div className="space-y-4">
          <ShimmerLoader height={80} width="100%" />
          <ShimmerLoader height={200} width="100%" />
          <ShimmerLoader height={300} width="100%" />
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Live Stats">
        <GlassCard className="p-6 text-center">
          <p className="text-red-400 mb-2">Error: {error}</p>
          <button onClick={() => window.location.reload()} className="text-primary underline">Retry</button>
        </GlassCard>
      </PageShell>
    );
  }

  if (liveMatches.length === 0) {
    return (
      <PageShell title="Live Stats">
        <GlassCard className="p-8 text-center">
          <Activity className="h-16 w-16 text-primary/30 mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">No live action right now</p>
          <p className="text-muted-foreground">Check back during match hours or view fixtures</p>
        </GlassCard>
      </PageShell>
    );
  }

  return (
    <PageShell title="Live Stats">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Match Switcher Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {liveMatches.map(match => (
            <button
              key={match.id}
              onClick={() => setActiveMatchId(match.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                activeMatchId === match.id
                  ? "bg-primary text-white"
                  : "glass hover:bg-white/20"
              }`}
            >
              {match.home_team.substring(0, 3)} vs {match.away_team.substring(0, 3)}
            </button>
          ))}
        </div>

        {activeMatch && (
          <>
            {/* Active Scoreboard */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <StatusBadge status={activeMatch.status} minute={activeMatch.minute} />
                <button className="p-2 text-muted-foreground hover:text-primary">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 flex-1">
                  <TeamLogo name={activeMatch.home_team.substring(0, 3)} color="#00A859" />
                  <div>
                    <div className="font-bold text-xl">{activeMatch.home_team}</div>
                    <div className="text-sm text-muted-foreground">{activeMatch.venue}</div>
                  </div>
                </div>
                <div className="text-5xl font-black tabular-nums px-6">
                  {activeMatch.home_score} : {activeMatch.away_score}
                </div>
                <div className="flex items-center gap-4 flex-1 justify-end">
                  <div className="text-right">
                    <div className="font-bold text-xl">{activeMatch.away_team}</div>
                  </div>
                  <TeamLogo name={activeMatch.away_team.substring(0, 3)} color="#4361EE" />
                </div>
              </div>
              <div className="flex justify-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Minute {activeMatch.minute}</span>
                </div>
              </div>
            </GlassCard>

            {/* Event Timeline */}
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="font-bold">Match Timeline</h3>
              </div>
              {activeMatch.events.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No events yet</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {activeMatch.events
                    .sort((a, b) => b.minute - a.minute)
                    .map((event, index) => {
                      const eventIcon = typeof event.type === 'string' ? getEventIcon(event.type as "goal" | "yellow_card" | "red_card" | "substitution") : "•";
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 p-3 glass rounded-lg"
                        >
                          <div className="text-2xl">{eventIcon}</div>
                          <div className="flex-1">
                            <div className="font-medium">{getEventText(event as MatchEvent, activeMatch)}</div>
                            <div className="text-xs text-muted-foreground">{event.minute}&apos;</div>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              )}
            </GlassCard>

            {/* Simulate Goal Button (for testing) */}
            <button
              onClick={simulateGoal}
              disabled={simulatingGoal}
              className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {simulatingGoal ? "Simulating..." : "Simulate Goal"}
            </button>

            {/* Celebration Overlay */}
            <AnimatePresence>
              {showConfetti && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
                >
                  <div className="text-6xl animate-bounce">🎉</div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </PageShell>
  );
}