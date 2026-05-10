"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { GlassCard } from "@/components/GlassCard";
import { PageShell } from "@/components/PageShell";
import { TeamLogo } from "@/components/StatusBadge";
import { Shirt, BarChart3, User } from "lucide-react";
import { ShareButton } from "@/components/ShareButton";
import { sanitizeHtml } from "@/lib/sanitize";
import type { Player } from "@/lib/queries";

export default function PlayerProfileClient({ player }: { player: Player }) {
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

  return (
    <PageShell>
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
                <Image
                  src={player.photo || "/favicon.png"}
                  alt={player.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{player.name}</h1>
                <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
                  <TeamLogo name={player.team.substring(0, 3)} color="#00A859" />
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
            </div>
          </GlassCard>
        </motion.div>

        {/* Bio */}
        {player.bio && (
          <motion.div variants={item}>
            <GlassCard className="p-6">
               <div className="flex items-center gap-2 mb-3">
                 <User className="h-5 w-5 text-primary" />
                 <h2 className="text-xl font-bold">Biography</h2>
               </div>
               <p className="text-muted-foreground mb-3">{sanitizeHtml(player.bio)}</p>
            </GlassCard>
          </motion.div>
        )}

         {/* Statistics Grid */}
         <motion.div variants={item}>
           <GlassCard className="p-6">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 <BarChart3 className="h-5 w-5 text-primary" />
                 <h2 className="text-xl font-bold">Statistics</h2>
               </div>
               <ShareButton
                 title={`${player.name} - Player Stats`}
                 text={`Check out ${player.name} stats on HallsSports: ${player.goals || 0} goals, ${player.assists || 0} assists`}
                 url={`${typeof window !== "undefined" ? window.location.origin : ""}/players/${player.id}`}
               />
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div variants={item} className="text-center p-3 glass rounded-lg">
                <div className="text-3xl font-bold text-primary">{player.goals || 0}</div>
                <div className="text-sm text-muted-foreground">Goals</div>
              </motion.div>
              <motion.div variants={item} className="text-center p-3 glass rounded-lg">
                <div className="text-3xl font-bold text-primary">{player.assists || 0}</div>
                <div className="text-sm text-muted-foreground">Assists</div>
              </motion.div>
              <motion.div variants={item} className="text-center p-3 glass rounded-lg">
                <div className="text-3xl font-bold text-primary">{player.yellow_cards || 0}</div>
                <div className="text-sm text-muted-foreground">Yellow Cards</div>
              </motion.div>
              <motion.div variants={item} className="text-center p-3 glass rounded-lg">
                <div className="text-3xl font-bold text-primary">{player.red_cards || 0}</div>
                <div className="text-sm text-muted-foreground">Red Cards</div>
              </motion.div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </PageShell>
  );
}