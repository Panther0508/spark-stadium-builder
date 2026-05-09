"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { PageShell } from "@/components/PageShell";
import { StatusBadge, TeamLogo } from "@/components/StatusBadge";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";

const MOCK_LINEUP = {
  match: {
    id: "mock-1",
    home_team: "Rangers FC",
    away_team: "Panthers United",
    home_score: 2,
    away_score: 1,
    status: "live" as const,
    minute: 78,
    venue: "Halls Stadium",
  },
  formations: {
    home: {
      name: "4-4-2",
      players: [
        { id: 1, name: "Dan Miller", number: 1, position: "GK", x: 50, y: 95 },
        { id: 2, name: "Chris Brown", number: 2, position: "DEF", x: 20, y: 80 },
        { id: 3, name: "Tom Davis", number: 5, position: "DEF", x: 35, y: 75 },
        { id: 4, name: "Mike Johnson", number: 6, position: "DEF", x: 65, y: 75 },
        { id: 5, name: "Rob Lee", number: 3, position: "DEF", x: 80, y: 80 },
        { id: 6, name: "Alex Smith", number: 7, position: "MID", x: 25, y: 55 },
        { id: 7, name: "James Wilson", number: 8, position: "MID", x: 40, y: 50 },
        { id: 8, name: "Sam Taylor", number: 10, position: "MID", x: 60, y: 50 },
        { id: 9, name: "Pat King", number: 11, position: "MID", x: 75, y: 55 },
        { id: 10, name: "Luke Adams", number: 9, position: "FWD", x: 40, y: 25 },
        { id: 11, name: "Nick Black", number: 12, position: "FWD", x: 60, y: 25 },
      ],
    },
    away: {
      name: "4-3-3",
      players: [
        { id: 12, name: "Matt White", number: 1, position: "GK", x: 50, y: 5 },
        { id: 13, name: "Ben Hall", number: 2, position: "DEF", x: 20, y: 20 },
        { id: 14, name: "Tim Green", number: 5, position: "DEF", x: 35, y: 15 },
        { id: 15, name: "Mark Evans", number: 6, position: "DEF", x: 65, y: 15 },
        { id: 16, name: "Ethan Moore", number: 3, position: "DEF", x: 80, y: 20 },
        { id: 17, name: "Jack Hill", number: 7, position: "MID", x: 30, y: 45 },
        { id: 18, name: "Ryan Clark", number: 8, position: "MID", x: 50, y: 40 },
        { id: 19, name: "Noah Young", number: 10, position: "MID", x: 70, y: 45 },
        { id: 20, name: "Julian Roberts", number: 11, position: "FWD", x: 15, y: 30 },
        { id: 21, name: "Mason Wright", number: 9, position: "FWD", x: 50, y: 20 },
        { id: 22, name: "Logan Scott", number: 12, position: "FWD", x: 85, y: 30 },
      ],
    },
  },
  adminPost: "Rangers dominated the first half with superior possession. Panthers came back strong in the second half but couldn't find the equalizer. A controversial red card changed the game.",
  aiSummary: "A tightly contested battle with midfield dominance from Rangers. The 78th minute red card proved decisive as Panthers pushed for an equalizer but ultimately fell short. James Wilson's brace secured the crucial three points.",
  keyMoments: [
    { id: 1, type: "goal", minute: 23, player: "James Wilson", team: "home" },
    { id: 2, type: "yellow_card", minute: 34, player: "Tom Davis", team: "home" },
    { id: 3, type: "goal", minute: 45, player: "Alex Smith", team: "away" },
    { id: 4, type: "red_card", minute: 58, player: "Tom Davis", team: "home" },
    { id: 5, type: "goal", minute: 67, player: "James Wilson", team: "home" },
  ],
};




export default function LineupPage() {
  const [lineup, setLineup] = useState<typeof MOCK_LINEUP | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    const fetchLineup = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setLineup(MOCK_LINEUP);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load lineup");
      } finally {
        setLoading(false);
      }
    };
    fetchLineup();
  }, []);

  if (loading) {
    return (
      <PageShell title="Lineup">
        <div className="space-y-4">
          <ShimmerLoader height={300} width="100%" />
          <ShimmerLoader height={200} width="100%" />
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Lineup">
        <GlassCard className="p-6 text-center">
          <p className="text-red-400 mb-2">Error: {error}</p>
          <button onClick={() => window.location.reload()} className="text-primary underline">Retry</button>
        </GlassCard>
      </PageShell>
    );
  }

  if (!lineup) {
    return (
      <PageShell title="Lineup">
        <GlassCard className="p-6 text-center">
          <p className="text-muted-foreground">No lineup data available</p>
        </GlassCard>
      </PageShell>
    );
  }

  return (
    <PageShell title="Match Lineup">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Match Header */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TeamLogo name={lineup.match.home_team.substring(0, 3)} color="#00A859" />
              <div>
                <h3 className="font-bold">{lineup.match.home_team} vs {lineup.match.away_team}</h3>
                <p className="text-xs text-muted-foreground">{lineup.match.venue}</p>
              </div>
            </div>
            <StatusBadge status={lineup.match.status} minute={lineup.match.minute} />
          </div>
          <div className="text-center mt-3 text-2xl font-bold">
            {lineup.match.home_score} : {lineup.match.away_score}
          </div>
        </GlassCard>

        {/* Formation Pitch */}
        <GlassCard className="p-4">
          <h3 className="font-bold mb-4 text-center">Formation - {lineup.formations.home.name} vs {lineup.formations.away.name}</h3>
          <div className="relative h-[400px] bg-green-800/30 rounded-lg overflow-hidden">
            {/* Pitch markings */}
            <div className="absolute inset-4 border-2 border-white/30 rounded-full"></div>
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30"></div>
            
            {/* Home team players (bottom half) */}
            {lineup.formations.home.players.map(player => (
              <Link key={player.id} href={`/players/${player.id}`}>
                <motion.div
                  className="absolute w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold shadow-lg cursor-pointer hover:scale-110 transition-transform"
                  style={{ left: `${player.x}%`, top: `${player.y}%`, transform: "translate(-50%, -50%)" }}
                  whileHover={{ scale: 1.1 }}
                >
                  {player.number}
                </motion.div>
              </Link>
            ))}
            
            {/* Away team players (top half) */}
            {lineup.formations.away.players.map(player => (
              <Link key={player.id} href={`/players/${player.id}`}>
                <motion.div
                  className="absolute w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg cursor-pointer hover:scale-110 transition-transform"
                  style={{ left: `${player.x}%`, top: `${player.y}%`, transform: "translate(-50%, -50%)" }}
                  whileHover={{ scale: 1.1 }}
                >
                  {player.number}
                </motion.div>
              </Link>
            ))}
          </div>
        </GlassCard>

        {/* AI Match Insight */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-bold">AI Insight</h3>
          </div>
          <p className="text-sm mb-4">{showOriginal ? lineup.adminPost : lineup.aiSummary}</p>
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="flex items-center gap-1 text-xs text-primary"
          >
            {showOriginal ? "Show AI Summary" : "Show Original Post"}
            {showOriginal ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </GlassCard>

        {/* Key Moments */}
        <GlassCard className="p-4">
          <h3 className="font-bold mb-3">Key Moments</h3>
          <div className="space-y-2">
            {lineup.keyMoments.map(moment => (
              <div key={moment.id} className="flex items-center gap-3 p-2 glass rounded-lg">
                <span className="text-lg">
                  {moment.type === "goal" ? "⚽" : moment.type === "yellow_card" ? "🟨" : "🟥"}
                </span>
                <div className="flex-1">
                  <span className="font-medium">{moment.player}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {moment.team === "home" ? lineup.match.home_team : lineup.match.away_team}
                  </span>
                </div>
                <span className="text-sm font-bold">{moment.minute}&apos;</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </PageShell>
  );
}