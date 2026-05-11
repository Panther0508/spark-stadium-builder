"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "./GlassCard";
import { TeamLogo } from "./StatusBadge";
import { format } from "date-fns";
import { Trophy, Users, Check, RefreshCw } from "lucide-react";
import type { Match } from "@/lib/queries";

interface FanClubGateProps {
  onSelect: (match: { match_id: string; match_name: string }) => void;
}

export function FanClubGate({ onSelect }: FanClubGateProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch("/api/matches");
        if (!res.ok) throw new Error("Failed to fetch");
        const data: Match[] = await res.json();
        
        // Filter: community_visible = true AND NOT finished
        const available = data.filter(m => 
          m.community_visible && 
          ['scheduled', 'live', 'half-time'].includes(m.status)
        ).sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());
        
        setMatches(available);
      } catch (err) {
        console.error("Failed to load gate matches", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const handleEnter = () => {
    const match = matches.find(m => m.id === selectedId);
    if (match) {
      const selection = {
        match_id: match.id,
        match_name: `${match.home_team} vs ${match.away_team}`
      };
      localStorage.setItem("hallssports_active_match", JSON.stringify(selection));
      onSelect(selection);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        <GlassCard className="p-8 flex flex-col h-full overflow-hidden border-primary/30">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-glow">Pick Your Match</h2>
            <p className="text-muted-foreground">
              Choose the match you want to follow – you&apos;ll get special celebrations when your team scores!
            </p>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 mb-8 min-h-[200px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Finding active matches...</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Trophy className="h-16 w-16 text-primary/20 mb-4" />
                <p className="text-lg font-medium">No matches available right now</p>
                <p className="text-sm text-muted-foreground">Check back later for live tournament action!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map((match) => (
                  <button
                    key={match.id}
                    onClick={() => setSelectedId(match.id)}
                    className={`relative p-4 rounded-2xl text-left transition-all border-2 ${
                      selectedId === match.id 
                        ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(0,168,89,0.3)]" 
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      {match.status === 'live' || match.status === 'half-time' ? (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Live
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                          {format(new Date(match.match_date), "MMM d, h:mm a")}
                        </span>
                      )}
                      {selectedId === match.id && (
                        <div className="bg-primary text-white rounded-full p-0.5">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <TeamLogo name={(match.home_team || "UNK").substring(0, 3)} color="#00A859" size="sm" />
                        <TeamLogo name={(match.away_team || "UNK").substring(0, 3)} color="#00A859" size="sm" />
                      </div>
                      <div className="flex-1 truncate">
                        <p className="text-sm font-bold truncate">
                          {match.home_team} vs {match.away_team}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {match.venue || "Tournament Stadium"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleEnter}
              disabled={!selectedId}
              className={`px-10 py-4 rounded-xl font-bold text-lg transition-all ${
                selectedId 
                  ? "bg-primary text-white shadow-lg shadow-primary/40 animate-pulse hover:scale-105" 
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              }`}
            >
              Enter Community
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}