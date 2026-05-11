"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { PageShell } from "@/components/PageShell";
import { TeamLogo } from "@/components/StatusBadge";
import { BackButton } from "@/components/BackButton";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Standing {
  id: string;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  trend: 'up' | 'down' | 'same';
  logo?: string;
}

export default function StandingsPage() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const res = await fetch("/api/standings");
        if (!res.ok) throw new Error("Failed to fetch standings");
        const json: { standings: Standing[] } = await res.json();
        setStandings(json.standings);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load standings");
      } finally {
        setLoading(false);
      }
    };
    fetchStandings();
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <PageShell title="Standings">
        <div className="space-y-4">
          <ShimmerLoader height={80} width="100%" />
          {[...Array(10)].map((_, i) => (
            <ShimmerLoader key={i} height={60} width="100%" />
          ))}
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Standings">
        <GlassCard className="p-6 text-center">
          <p className="text-red-400 mb-2">Error: {error}</p>
          <button onClick={() => window.location.reload()} className="text-primary underline">
            Retry
          </button>
        </GlassCard>
      </PageShell>
    );
  }

  return (
    <PageShell title="Standings">
      <BackButton />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        {/* Header */}
        <GlassCard className="p-4">
          <div className="grid grid-cols-5 text-sm font-bold text-muted-foreground">
            <div className="col-span-2">Team</div>
            <div className="text-center">P</div>
            <div className="text-center">GD</div>
            <div className="text-center">Pts</div>
          </div>
        </GlassCard>

        {/* Standings list */}
        {standings.map((team, index) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <GlassCard className="p-4">
              <div className="grid grid-cols-5 items-center">
                <div className="col-span-2 flex items-center gap-3">
                  <span className="w-6 text-primary font-bold">{index + 1}</span>
                  <TeamLogo name={team.team.substring(0, 3)} color="#00A859" />
                  <span className="font-medium truncate">{team.team}</span>
                  {index < 2 && <Trophy className="h-4 w-4 text-yellow-500" />}
                </div>
                <div className="text-center text-sm">{team.played}</div>
                <div className="text-center text-sm">
                  <span className={team.gd > 0 ? "text-green-500" : team.gd < 0 ? "text-red-500" : ""}>
                    {team.gd > 0 ? "+" : ""}{team.gd}
                  </span>
                </div>
                <div className="text-center flex items-center justify-center gap-2">
                  <span className="font-bold text-lg text-primary">{team.points}</span>
                  {getTrendIcon(team.trend)}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </PageShell>
  );
}