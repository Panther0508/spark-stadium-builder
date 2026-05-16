"use client";

import { GlassCard } from "@/components/GlassCard";
import { PageShell } from "@/components/PageShell";
import { TeamLogo } from "@/components/StatusBadge";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { format } from "date-fns";

interface Player {
  id: string;
  name: string;
  team: string;
  position: string;
  number: number;
  photo?: string;
  bio?: string;
  appearances?: number;
  goals?: number;
  assists?: number;
  yellow_cards?: number;
  red_cards?: number;
}

interface MatchEvent {
  id: string;
  type: string;
  minute: number;
  matches: {
    home_team: { name: string } | string;
    away_team: { name: string } | string;
    match_date: string;
  };
}

export default function PlayerProfileClient({ player, recentMatches }: { player: Player; recentMatches: MatchEvent[] }) {
  return (
    <PageShell title={player.name}>
      <div className="space-y-6">
        <GlassCard className="p-6 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-primary/20">
            {player.photo ? (
              <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-2xl font-bold">
                {player.name.charAt(0)}
              </div>
            )}
          </div>
          <h1 className="text-2xl font-black">{player.name}</h1>
          <div className="flex items-center justify-center gap-2 text-primary font-bold">
            <TeamLogo name={player.team.substring(0, 3)} color="#00A859" size="sm" />
            <span>{player.team}</span>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {player.position} &bull; #{player.number}
          </div>
        </GlassCard>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Apps", value: player.appearances || 0 },
            { label: "Goals", value: player.goals || 0 },
            { label: "Assists", value: player.assists || 0 },
            { label: "Yellow", value: player.yellow_cards || 0 },
            { label: "Red", value: player.red_cards || 0 },
          ].map((stat) => (
            <GlassCard key={stat.label} className="p-4 text-center">
              <div className="text-2xl font-black text-primary">
                <AnimatedCounter value={stat.value} />
              </div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground">{stat.label}</div>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="p-6">
          <h3 className="font-bold mb-4">Bio</h3>
          <p className="text-muted-foreground leading-relaxed">
            {player.bio || "No bio yet."}
          </p>
        </GlassCard>

        <div className="space-y-4">
          <h3 className="font-bold">Recent Matches</h3>
          {recentMatches.length === 0 ? (
            <GlassCard className="p-6 text-center text-muted-foreground">No recent matches.</GlassCard>
          ) : (
recentMatches.map((match) => (
               <GlassCard key={match.id} className="p-4 flex items-center justify-between">
                 <div>
                   <div className="font-bold">
                     {typeof match.matches.home_team === 'string' ? match.matches.home_team : match.matches.home_team.name} vs {typeof match.matches.away_team === 'string' ? match.matches.away_team : match.matches.away_team.name}
                   </div>
                   <div className="text-xs text-muted-foreground">{format(new Date(match.matches.match_date), "MMM d, yyyy")}</div>
                 </div>
                 <div className="text-xs font-bold bg-primary/20 text-primary px-2 py-1 rounded">
                   {match.type.toUpperCase()} - {match.minute}&apos;
                 </div>
               </GlassCard>
             ))
          )}
        </div>
      </div>
    </PageShell>
  );
}