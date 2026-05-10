"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { PageShell } from "@/components/PageShell";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { ShareButton } from "@/components/ShareButton";
import { useMatchRealtime } from "@/hooks/useMatchRealtime";
import { format } from "date-fns";
import type { Match, MatchEvent } from "@/lib/queries";

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
  const [celebration, setCelebration] = useState<{ active: boolean; text: string } | null>(null);

  const handleGoal = useCallback((event: MatchEvent) => {
    setCelebration({
      active: true,
      text: `GOAL! ${event.player_name} scores!`
    });
    setTimeout(() => setCelebration(null), 10000);
  }, []);

  const { match, events, isPolling, error } = useMatchRealtime(
    initialMatch,
    initialEvents,
    handleGoal
  );

  if (!match) {
    return (
      <PageShell>
        <Link
          href="/matches"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> All matches
        </Link>
        <GlassCard className="p-6 text-center">
          <p className="text-red-400 mb-2">Match not found</p>
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
    <>
      <PageShell>
        <AnimatePresence>
          {celebration && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none"
            >
               <motion.div 
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="bg-primary text-white px-10 py-5 rounded-3xl shadow-[0_0_50px_rgba(0,168,89,0.8)] border-4 border-white/50 text-center"
               >
                 <h2 className="text-6xl font-black italic mb-2 tracking-tighter">GOALLL!!!</h2>
                 <p className="text-xl font-bold uppercase tracking-widest">{celebration.text.split('! ')[1]}</p>
               </motion.div>
               {/* Confetti simulation would go here */}
            </motion.div>
          )}
        </AnimatePresence>

        <Link
          href="/matches"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> All matches
        </Link>

        {error && (
          <div className="mb-4 p-2 rounded bg-yellow-900/20 border border-yellow-500/30 text-yellow-200 text-sm text-center">
            Updates are temporarily paused. Retrying in background…
          </div>
        )}

         <GlassCard className={`p-6 mb-4 transition-all duration-500 ${celebration ? "border-primary shadow-[0_0_30px_rgba(0,168,89,0.4)] scale-[1.02]" : ""}`}>
           <div className="flex items-center justify-between mb-4">
             <StatusBadge
               status={match.status}
               minute={match.status === "live" ? undefined : undefined}
               isPolling={isPolling}
             />
             <span className="text-sm text-muted-foreground">
               {format(new Date(match.match_date), "MMM d, h:mm a")}
             </span>
           </div>
           <div className="text-center">
             <div className="flex items-center justify-center gap-4 mb-4">
               <div className="text-center">
                 <div className="text-2xl font-bold">{match.home_team}</div>
               </div>
               <motion.div 
                 animate={celebration ? { scale: [1, 1.4, 1], color: ["#fff", "#FFD700", "#fff"] } : {}}
                 transition={{ duration: 0.4, repeat: celebration ? 4 : 0 }}
                 className="text-4xl font-black tabular-nums" 
                 aria-live="polite"
               >
                 {match.status === "scheduled"
                   ? "—"
                   : `${match.home_score ?? 0} : ${match.away_score ?? 0}`}
               </motion.div>
               <div className="text-center">
                 <div className="text-2xl font-bold">{match.away_team}</div>
               </div>
             </div>
             {match.venue && (
               <p className="text-muted-foreground">Venue: {match.venue}</p>
             )}
           </div>
         </GlassCard>

         {events.length > 0 && (
           <GlassCard className="p-4">
             <h3 className="font-bold mb-3">Match Events</h3>
             <div className="space-y-2">
               {events.map((event) => (
                 <motion.div
                   key={event.id}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="flex items-center gap-3 text-sm"
                   aria-live="polite"
                 >
                   <span className="font-bold text-primary">
                     {event.minute}&apos;
                   </span>
                   <span>{eventIcons[event.type]}</span>
                   <span className="flex-1">{event.player_name}</span>
                   {event.assist && (
                     <span className="text-muted-foreground">
                       (Assist: {event.assist})
                     </span>
                   )}
                 </motion.div>
               ))}
             </div>
           </GlassCard>
         )}

        {match.status === "finished" && (
          <div className="mt-4 flex justify-end">
            <ShareButton
              title={`${match.home_team} vs ${match.away_team} - Match Stats`}
              text={`Check out the match stats for ${match.home_team} vs ${match.away_team} on HallsSports! ⚽`}
              url={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/match/${match.id}`}
            />
          </div>
        )}
      </PageShell>
    </>
  );
}