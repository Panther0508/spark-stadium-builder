"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { GlassCard } from "@/components/GlassCard";
import { PageShell } from "@/components/PageShell";
import { TeamLogo } from "@/components/StatusBadge";
import { BackButton } from "@/components/BackButton";
import { Shirt, BarChart3, User, Calendar, Award } from "lucide-react";
import { ShareButton } from "@/components/ShareButton";
import { sanitizeHtml } from "@/lib/sanitize";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import type { Player } from "@/lib/queries";

interface MatchEventWithMatch {
  type: string;
  minute?: number;
  matches: {
    home_team_id: string;
    away_team_id: string;
    home_score: number;
    away_score: number;
    status: string;
    match_date: string;
    home_team: { name: string; logo_url?: string };
    away_team: { name: string; logo_url?: string };
  };
}

interface PlayerProfileClientProps {
  player: Player & { appearances?: number; team_id?: string };
  recentMatches: MatchEventWithMatch[];
}

export default function PlayerProfileClient({ player, recentMatches }: PlayerProfileClientProps) {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const stats = [
    { label: "Appearances", value: player.appearances || 0, icon: Calendar },
    { label: "Goals", value: player.goals || 0, icon: Award },
    { label: "Assists", value: player.assists || 0, icon: Award },
    { label: "Yellow Cards", value: player.yellow_cards || 0, icon: Award },
    { label: "Red Cards", value: player.red_cards || 0, icon: Award },
  ];

  return (
    <PageShell>
      <BackButton />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
        className="space-y-6"
      >
        {/* Hero Header */}
        <motion.div variants={item}>
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-primary/30 bg-white/5">
                {player.photo ? (
                  <Image
                    src={player.photo}
                    alt={player.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-4xl font-bold">
                    {player.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{player.name}</h1>
                <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
                  <TeamLogo name={(player.team || "UNK").substring(0, 3)} color="#00A859" />
                  <span className="text-xl font-semibold">{player.team}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-4 text-sm">
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full font-medium">
                    {player.position}
                  </span>
                  <div className="flex items-center gap-1">
                    <Shirt className="h-4 w-4" />
                    <span>#{player.number}</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                 <ShareButton
                   title={`${player.name} - Player Stats`}
                   text={`Check out ${player.name} stats on HallsSports!`}
                   url={typeof window !== "undefined" ? window.location.href : ""}
                 />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {stats.map((stat, idx) => (
            <GlassCard key={idx} className="p-4 text-center flex flex-col items-center justify-center">
              <stat.icon className="h-5 w-5 text-primary/50 mb-2" />
              <div className="text-2xl font-black text-primary">
                <AnimatedCounter value={stat.value} />
              </div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mt-1">
                {stat.label}
              </div>
            </GlassCard>
          ))}
        </motion.div>

        {/* Bio & Recent Matches */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={item} className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {player.bio && (
              <GlassCard className="p-6">
                 <div className="flex items-center gap-2 mb-4 text-primary">
                   <User className="h-5 w-5" />
                   <h2 className="text-xl font-bold">Biography</h2>
                 </div>
                 <p className="text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(player.bio) }} />
              </GlassCard>
            )}

            {/* Recent Matches */}
            <GlassCard className="p-6">
               <div className="flex items-center gap-2 mb-6 text-primary">
                 <BarChart3 className="h-5 w-5" />
                 <h2 className="text-xl font-bold">Recent Matches</h2>
               </div>
               
               {recentMatches.length === 0 ? (
                 <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
                   <p className="text-muted-foreground text-sm">No recent match data available</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                   {recentMatches.map((event, idx) => {
                     const match = event.matches;
                     const isHome = match.home_team_id === player.team_id;
                     const opponent = isHome ? match.away_team : match.home_team;
                     const result = match.status === 'finished' 
                        ? (isHome ? (match.home_score > match.away_score ? 'W' : match.home_score === match.away_score ? 'D' : 'L') 
                                  : (match.away_score > match.home_score ? 'W' : match.home_score === match.away_score ? 'D' : 'L'))
                        : '-';
                     
                     return (
                       <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                           result === 'W' ? 'bg-green-500/20 text-green-400' : 
                           result === 'L' ? 'bg-red-500/20 text-red-400' : 
                           'bg-yellow-500/20 text-yellow-400'
                         }`}>
                           {result}
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2">
                             <span className="font-bold text-sm truncate">vs {opponent.name}</span>
                             <span className="text-[10px] text-muted-foreground">
                               {new Date(match.match_date).toLocaleDateString()}
                             </span>
                           </div>
                           <div className="text-xs text-primary font-medium mt-0.5 capitalize">
                             {event.type} {event.minute && `(${event.minute}')`}
                           </div>
                         </div>
                         <div className="text-xs font-bold whitespace-nowrap">
                           {match.home_score} - {match.away_score}
                         </div>
                       </div>
                     );
                   })}
                 </div>
               )}
            </GlassCard>
          </motion.div>

          <motion.div variants={item} className="space-y-6">
            {/* Team Info Card */}
            <GlassCard className="p-6 text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <TeamLogo name={(player.team || "UNK").substring(0, 3)} color="#00A859" size="lg" />
              </div>
              <h3 className="text-xl font-bold mb-1">{player.team}</h3>
              <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Team</p>
              
              <div className="mt-6 pt-6 border-t border-white/10">
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-sm text-muted-foreground">Position</span>
                   <span className="text-sm font-bold text-primary">{player.position}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm text-muted-foreground">Jersey No.</span>
                   <span className="text-sm font-bold text-primary">#{player.number}</span>
                 </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </motion.div>
    </PageShell>
  );
}