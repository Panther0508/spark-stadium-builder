"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { PageShell } from "@/components/PageShell";
import { Search, User, Shirt } from "lucide-react";
import { BackButton } from "@/components/BackButton";

type Player = {
  id: string;
  name: string;
  team: string;
  position: string;
  number: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  photo?: string;
};

const POSITION_FILTERS = ["All", "Forwards", "Midfielders", "Defenders", "Goalkeepers", "Carded"];

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("All");
  const [showCardedOnly, setShowCardedOnly] = useState(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch("/api/players");
        if (!res.ok) throw new Error("Failed to load players");
        const data: Player[] = await res.json();
        setPlayers(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load players");
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  const filteredPlayers = useMemo(() => {
    let result = players;
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.team.toLowerCase().includes(lower) ||
          p.position.toLowerCase().includes(lower)
      );
    }
    if (positionFilter !== "All") {
      const map: Record<string, string> = {
        Forwards: "Forward",
        Midfielders: "Midfielder",
        Defenders: "Defender",
        Goalkeepers: "Goalkeeper",
      };
      result = result.filter((p) => p.position === map[positionFilter]);
    }
    if (showCardedOnly) {
      result = result.filter((p) => p.yellow_cards > 0 || p.red_cards > 0);
    }
    return result;
  }, [players, search, positionFilter, showCardedOnly]);

  if (loading) {
    return (
      <PageShell title="Players">
        <BackButton />
        <ShimmerLoader height={400} width="100%" />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Players">
        <BackButton />
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
    <PageShell title="Players">
      <BackButton />
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/10 focus:border-primary outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {POSITION_FILTERS.map((pos) => (
            <button
              key={pos}
              onClick={() => setPositionFilter(pos)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                positionFilter === pos
                  ? "bg-primary text-white"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={showCardedOnly}
            onChange={(e) => setShowCardedOnly(e.target.checked)}
            className="h-4 w-4 rounded"
          />
          Carded only
        </label>
      </div>

      {/* Player Grid */}
      {filteredPlayers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No players found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map((player, idx) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <GlassCard className="p-4 flex flex-col items-center text-center">
                <div className="relative w-20 h-20 rounded-full overflow-hidden mb-3 ring-2 ring-primary/30">
                  {player.photo ? (
                    <Image src={player.photo} alt={player.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg">{player.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {player.team} • #{player.number}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-xs text-primary">
                  <Shirt className="h-3 w-3" />
                  {player.position}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center w-full">
                  <div>
                    <div className="font-bold text-primary">{player.goals}</div>
                    <div className="text-xs text-muted-foreground">Goals</div>
                  </div>
                  <div>
                    <div className="font-bold text-primary">{player.assists}</div>
                    <div className="text-xs text-muted-foreground">Assists</div>
                  </div>
                  <div>
                    <div className="font-bold text-primary">{player.yellow_cards + player.red_cards}</div>
                    <div className="text-xs text-muted-foreground">Cards</div>
                  </div>
                </div>
                <Link href={`/players/${player.id}`} className="mt-4 text-xs text-primary hover:underline">
                  View profile &rarr;
                </Link>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </PageShell>
  );
}