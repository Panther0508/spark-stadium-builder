"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { PageShell } from "@/components/PageShell";
import { StatusBadge, TeamLogo } from "@/components/StatusBadge";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";

interface LineupData {
  id: string;
  name: string;
  number: number;
  position: string;
  x: number;
  y: number;
}

interface Formation {
  name: string;
  players: LineupData[];
}

interface LineupResponse {
  match: {
    id: string;
    home_team: string;
    away_team: string;
    home_score?: number;
    away_score?: number;
    status: "live" | "scheduled" | "finished" | "half-time";
    minute?: number;
    venue?: string;
  };
  formations: {
    home: Formation;
    away: Formation;
  };
  adminPost?: string;
  aiSummary?: string;
  keyMoments: Array<{
    id: string;
    type: string;
    minute: number;
    player: string;
    team: string;
  }>;
}




export default function LineupPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const matchId = resolvedParams.id;
  
  const [lineup, setLineup] = useState<LineupResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    const fetchLineup = async () => {
      try {
        const res = await fetch(`/api/lineup?match_id=${matchId}`);
        if (!res.ok) throw new Error('Failed to fetch lineup');
        const data = await res.json();
        setLineup(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load lineup");
      } finally {
        setLoading(false);
      }
    };
    fetchLineup();
  }, [matchId]);

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
              <TeamLogo name={(lineup.match.home_team || "UNK").substring(0, 3)} color="#00A859" />
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

        {lineup.aiSummary && (
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-bold">AI Insight</h3>
          </div>
          <p className="text-sm mb-4">{showOriginal ? lineup.adminPost : lineup.aiSummary}</p>
          {lineup.adminPost && (
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className="flex items-center gap-1 text-xs text-primary"
            >
              {showOriginal ? "Show AI Summary" : "Show Original Post"}
              {showOriginal ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          )}
        </GlassCard>
        )}

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