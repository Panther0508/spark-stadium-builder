"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { PageShell } from "@/components/PageShell";
import { TeamLogo } from "@/components/StatusBadge";
import { ChevronDown, ChevronUp, Shirt, Clock, BarChart3, User } from "lucide-react";
import { ShareButton } from "@/components/ShareButton";
import { sanitizeHtml } from "@/lib/sanitize";

const MOCK_PLAYERS = [
  { 
    id: "p1", 
    name: "James Wilson", 
    team: "Rangers FC", 
    position: "Forward", 
    number: 9, 
    goals: 12, 
    assists: 5, 
    yellow_cards: 2, 
    red_cards: 0, 
    photo: "/images/players/player1.jpg",
    bio: "James Wilson is a prolific striker known for his clinical finishing and aerial ability. He joined Rangers FC in 2022 and quickly became the team's top scorer.",
    fullBio: "James Wilson was born in Manchester and started his professional career at the age of 16. Known for his powerful shot and excellent positioning, he has scored over 150 career goals. Wilson is also a dedicated mentor for young players in the academy, spending time every week coaching the U-14 team. His leadership on and off the pitch has made him a fan favorite.",
    stats: {
      appearances: 89,
      minutes: 7234,
      shots_on_target: 45,
      pass_completion: 78,
      tackles: 23,
    },
    recentMatches: [
      { id: "rm1", opponent: "Panthers United", date: "2025-01-15", result: "W 2-1", goals: 1, assists: 0 },
      { id: "rm2", opponent: "Thunder Wolves", date: "2025-01-10", result: "D 1-1", goals: 0, assists: 1 },
      { id: "rm3", opponent: "City Eagles", date: "2025-01-05", result: "W 3-0", goals: 2, assists: 0 },
      { id: "rm4", opponent: "Royal FC", date: "2024-12-28", result: "L 0-2", goals: 0, assists: 0 },
      { id: "rm5", opponent: "United Stars", date: "2024-12-22", result: "W 2-0", goals: 1, assists: 1 },
    ],
    teamLogo: "/images/teams/rangers.png"
  },
];

type Player = typeof MOCK_PLAYERS[0];

export default function PlayerProfilePage() {
  const params = useParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullBio, setShowFullBio] = useState(false);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 600));
        const foundPlayer = MOCK_PLAYERS.find(p => p.id === params.id) || MOCK_PLAYERS[0];
        setPlayer(foundPlayer);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load player");
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [params.id]);

  if (loading) {
    return (
      <PageShell title="Player Profile">
        <div className="space-y-4">
          <ShimmerLoader height={200} width="100%" />
          <ShimmerLoader height={100} width="100%" />
          <ShimmerLoader height={300} width="100%" />
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Player Profile">
        <GlassCard className="p-6 text-center">
          <p className="text-red-400 mb-2">Error: {error}</p>
          <button onClick={() => window.location.reload()} className="text-primary underline">Retry</button>
        </GlassCard>
      </PageShell>
    );
  }

  if (!player) {
    return (
      <PageShell title="Player Profile">
        <GlassCard className="p-6 text-center">
          <p className="text-muted-foreground">Player not found</p>
        </GlassCard>
      </PageShell>
    );
  }

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
              <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-primary/30">
                <Image
                  src={player.photo || "/images/players/default.jpg"}
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
        <motion.div variants={item}>
          <GlassCard className="p-6">
             <div className="flex items-center gap-2 mb-3">
               <User className="h-5 w-5 text-primary" />
               <h2 className="text-xl font-bold">Biography</h2>
             </div>
             <p className="text-muted-foreground mb-3">{sanitizeHtml(player.bio)}</p>
             <AnimatePresence>
               {showFullBio && (
                 <motion.div
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: "auto" }}
                   exit={{ opacity: 0, height: 0 }}
                   className="text-muted-foreground mt-3 pt-3 border-t border-white/10"
                 >
                   {sanitizeHtml(player.fullBio)}
                 </motion.div>
               )}
             </AnimatePresence>
            <button
              onClick={() => setShowFullBio(!showFullBio)}
              className="mt-3 text-primary hover:underline flex items-center gap-1"
            >
              {showFullBio ? "Read Less" : "Read More"}
              {showFullBio ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </GlassCard>
        </motion.div>

{/* Statistics Grid */}
         <motion.div variants={item}>
           <GlassCard className="p-6">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 <BarChart3 className="h-5 w-5 text-primary" />
                 <h2 className="text-xl font-bold">Career Statistics</h2>
               </div>
               <ShareButton
                 title={`${player.name} - Player Stats`}
                 text={`Check out ${player.name} stats on HallsSports: ${player.goals} goals, ${player.assists} assists`}
                 url={`${typeof window !== "undefined" ? window.location.origin : ""}/players/${player.id}`}
               />
             </div>
             <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <motion.div variants={item} className="text-center p-3 glass rounded-lg">
                <div className="text-3xl font-bold text-primary">{player.goals}</div>
                <div className="text-sm text-muted-foreground">Goals</div>
              </motion.div>
              <motion.div variants={item} className="text-center p-3 glass rounded-lg">
                <div className="text-3xl font-bold text-primary">{player.assists}</div>
                <div className="text-sm text-muted-foreground">Assists</div>
              </motion.div>
              <motion.div variants={item} className="text-center p-3 glass rounded-lg">
                <div className="text-3xl font-bold text-primary">{player.stats.appearances}</div>
                <div className="text-sm text-muted-foreground">Appearances</div>
              </motion.div>
              <motion.div variants={item} className="text-center p-3 glass rounded-lg">
                <div className="text-3xl font-bold text-primary">{player.stats.minutes}</div>
                <div className="text-sm text-muted-foreground">Minutes</div>
              </motion.div>
              <motion.div variants={item} className="text-center p-3 glass rounded-lg">
                <div className="text-3xl font-bold text-primary">{player.stats.shots_on_target}</div>
                <div className="text-sm text-muted-foreground">Shots on Target</div>
              </motion.div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Recent Matches */}
        <motion.div variants={item}>
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Recent Matches</h2>
            </div>
            <div className="space-y-2">
              {player.recentMatches.map(match => (
                <div key={match.id}>
                  <button
                    onClick={() => setExpandedMatch(expandedMatch === match.id ? null : match.id)}
                    className="w-full glass p-3 rounded-lg flex items-center justify-between hover:bg-white/20"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{match.opponent}</span>
                      <span className="text-sm text-muted-foreground">{match.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{match.result}</span>
                      {expandedMatch === match.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedMatch === match.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-3 pb-3"
                      >
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          <div>Goals: <span className="text-primary font-medium">{match.goals}</span></div>
                          <div>Assists: <span className="text-primary font-medium">{match.assists}</span></div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </PageShell>
  );
}