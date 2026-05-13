"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { GlassCard } from "@/components/GlassCard";
import { PageShell } from "@/components/PageShell";
import { BackButton } from "@/components/BackButton";
import { StatusBadge } from "@/components/StatusBadge";
import { useMatchRealtime } from "@/hooks/useMatchRealtime";
import { format } from "date-fns";
import type { Match, MatchEvent } from "@/lib/queries";
import { Sparkles, Users } from "lucide-react";
import Image from "next/image";

interface MatchLiveClientProps {
  initialMatch: Match;
  initialEvents: MatchEvent[];
}

const eventIcons = {
  goal: "⚽",
  yellow: "🟨",
  red: "🟥",
  sub: "🔄",
} as const;

export default function MatchLiveClient({
  initialMatch,
  initialEvents,
}: MatchLiveClientProps) {
  const [lineup, setLineup] = useState<unknown>(null);

  useEffect(() => {
    fetch(`/api/lineup?match_id=${initialMatch.id}`)
      .then(res => res.json())
      .then(data => setLineup(data))
      .catch(() => console.log("No lineup data found"));
  }, [initialMatch.id]);

  const onGoal = useCallback((event: MatchEvent) => {
    toast.success(`GOAL! ${event.player_name} has scored!`);
  }, []);

  const { match, events, isPolling } = useMatchRealtime(
    initialMatch,
    initialEvents,
    onGoal
  );

  if (!match) return null;

  return (
    <PageShell>
      <BackButton />
      
      {/* Hero */}
      <div className="relative w-full h-[250px] overflow-hidden bg-gradient-to-br from-primary/20 to-primary/40">
        {match.image_url ? (
          <Image 
            src={match.image_url} 
            alt="Match" 
            fill 
            className="object-cover opacity-60"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-black text-white/20 text-4xl uppercase tracking-tighter">
            {match.home_team} vs {match.away_team}
          </div>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/40">
           <StatusBadge status={match.status} isPolling={isPolling} />
           <div className="flex items-center gap-6 mt-4">
             <div className="text-xl font-bold">{match.home_team}</div>
             <div className="text-4xl font-black tabular-nums">{match.home_score} : {match.away_score}</div>
             <div className="text-xl font-bold">{match.away_team}</div>
           </div>
        </div>
      </div>

      <div className="px-4 -mt-10 space-y-4">
         <GlassCard className="p-6">
           <h2 className="font-bold text-lg mb-2">Match Preview</h2>
           <p className="text-muted-foreground text-sm leading-relaxed">{match.admin_post || "No match preview yet."}</p>
           <p className="text-xs text-muted-foreground mt-4">
             Kick-off: {format(new Date(match.match_date), "h:mm a")} • Duration: {match.duration_minutes || 90} minutes
           </p>
         </GlassCard>

         {/* Events */}
         <GlassCard className="p-4">
            <h3 className="font-bold mb-3">Timeline</h3>
            {events.length === 0 ? <p className="text-sm text-muted-foreground italic">No events yet.</p> : (
              <div className="space-y-3">
                 {events.map(e => (
                   <div key={e.id} className="flex items-center gap-3 text-sm border-l-2 border-primary/20 pl-3 py-1">
                     <span className="font-mono font-bold text-primary">{e.minute}&apos;</span>
                     <span>{eventIcons[e.type as keyof typeof eventIcons]}</span>
                     <span className="font-semibold">{e.player_name}</span>
                     {e.assist && <span className="text-xs text-muted-foreground">(Assist: {e.assist})</span>}
                   </div>
                 ))}
              </div>
            )}
         </GlassCard>

         {/* Lineup */}
         <GlassCard className="p-4">
           <h3 className="font-bold mb-3 flex items-center gap-2"><Users className="w-4 h-4"/> Lineups</h3>
           {!lineup ? <p className="text-sm text-muted-foreground italic">Lineup not available yet.</p> : (
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-3 glass rounded-xl text-center font-bold">Home Lineup</div>
                 <div className="p-3 glass rounded-xl text-center font-bold">Away Lineup</div>
              </div>
           )}
         </GlassCard>

         <GlassCard className="p-4 border-primary/20 bg-primary/5">
            <h3 className="font-bold flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-primary"/> AI Match Summary</h3>
            <p className="text-sm text-muted-foreground">AI-powered match summary coming soon.</p>
         </GlassCard>
      </div>
    </PageShell>
  );
}
