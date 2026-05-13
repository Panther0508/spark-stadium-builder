"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { PageShell } from "@/components/PageShell";
import { BackButton } from "@/components/BackButton";
import { Trophy } from "lucide-react";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { supabase } from "@/lib/supabase";

interface Standing {
  id: string;
  team_name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

export default function StandingsPage() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStandings = async () => {
    try {
      const { data, error } = await supabase.from('standings_with_teams').select('*');
      if (error) throw error;
      setStandings(data as Standing[] || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load standings");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
     // eslint-disable-next-line react-hooks/set-state-in-effect
     fetchStandings();
   }, []);

  if (loading) {
    return (
      <PageShell title="Standings">
        <BackButton />
        <div className="space-y-4">
          <ShimmerLoader height={80} width="100%" />
          {[...Array(8)].map((_, i) => <ShimmerLoader key={i} height={60} width="100%" />)}
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Standings">
        <BackButton />
        <ErrorState message={error} onRetry={fetchStandings} />
      </PageShell>
    );
  }

  if (standings.length === 0) {
    return (
      <PageShell title="Standings">
        <BackButton />
        <EmptyState 
          icon={<Trophy className="h-12 w-12 text-primary" />} 
          title="Standings will be calculated after matches are verified." 
        />
      </PageShell>
    );
  }

  return (
    <PageShell title="Standings">
      <BackButton />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto pb-4">
        <div className="min-w-[600px] glass rounded-2xl p-4">
          <div className="grid grid-cols-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
            <div className="col-span-1">Pos</div>
            <div className="col-span-4">Team</div>
            <div className="text-center">P</div>
            <div className="text-center">W</div>
            <div className="text-center">D</div>
            <div className="text-center">L</div>
            <div className="text-center">GF</div>
            <div className="text-center">GA</div>
            <div className="text-center">Pts</div>
          </div>

          <div className="space-y-2">
            {standings.map((team, index) => (
              <div
                key={team.id}
                className={`grid grid-cols-12 items-center text-sm font-bold p-3 rounded-xl transition-all ${
                  index < 3 ? 'bg-primary/10 border border-primary/20' : ''
                }`}
              >
                <div className="col-span-1">{index + 1}</div>
                <div className="col-span-4 flex items-center gap-2">
                  {index < 3 && <Trophy className="h-3 w-3 text-primary" />}
                  <span className="truncate">{team.team_name}</span>
                </div>
                <div className="text-center">{team.played}</div>
                <div className="text-center">{team.won}</div>
                <div className="text-center">{team.drawn}</div>
                <div className="text-center">{team.lost}</div>
                <div className="text-center">{team.goals_for}</div>
                <div className="text-center">{team.goals_against}</div>
                <div className="text-center text-primary">{team.points}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </PageShell>
  );
}
