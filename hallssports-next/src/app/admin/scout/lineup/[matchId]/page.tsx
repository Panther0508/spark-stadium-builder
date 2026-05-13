"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminCard } from "@/components/admin/AdminCard";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Trophy, Users, Save, RefreshCw, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { adminSelect } from "@/app/admin/actions";
import Link from "next/link";

interface Player {
  id: string;
  name: string;
  number: number;
  team_id: string;
}

interface Position {
  player_id: string;
  position_label: string;
  x: number;
  y: number;
}

interface LineupData {
  formation: string;
  positions: Position[];
}

interface Lineup {
  id: string;
  team_id: string;
  formation: string;
  positions: Array<{
    player_id: string;
    position_label: string;
    x: number;
    y: number;
  }>;
}

interface Match {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_team: { name: string };
  away_team: { name: string };
  match_date: string;
}

const FORMATIONS: Record<string, { label: string; positions: { label: string; x: number; y: number }[] }> = {
  "4-4-2": {
    label: "4-4-2",
    positions: [
      { label: "GK", x: 50, y: 5 },
      { label: "LB", x: 15, y: 25 },
      { label: "CB", x: 38, y: 25 },
      { label: "CB", x: 62, y: 25 },
      { label: "RB", x: 85, y: 25 },
      { label: "LM", x: 15, y: 55 },
      { label: "CM", x: 38, y: 55 },
      { label: "CM", x: 62, y: 55 },
      { label: "RM", x: 85, y: 55 },
      { label: "ST", x: 38, y: 85 },
      { label: "ST", x: 62, y: 85 },
    ],
  },
  "4-3-3": {
    label: "4-3-3",
    positions: [
      { label: "GK", x: 50, y: 5 },
      { label: "LB", x: 15, y: 25 },
      { label: "CB", x: 38, y: 25 },
      { label: "CB", x: 62, y: 25 },
      { label: "RB", x: 85, y: 25 },
      { label: "CM", x: 25, y: 55 },
      { label: "CM", x: 50, y: 50 },
      { label: "CM", x: 75, y: 55 },
      { label: "LW", x: 15, y: 80 },
      { label: "ST", x: 50, y: 85 },
      { label: "RW", x: 85, y: 80 },
    ],
  },
  "3-5-2": {
    label: "3-5-2",
    positions: [
      { label: "GK", x: 50, y: 5 },
      { label: "CB", x: 25, y: 25 },
      { label: "CB", x: 50, y: 25 },
      { label: "CB", x: 75, y: 25 },
      { label: "LM", x: 10, y: 55 },
      { label: "CM", x: 35, y: 55 },
      { label: "CM", x: 50, y: 45 },
      { label: "CM", x: 65, y: 55 },
      { label: "RM", x: 90, y: 55 },
      { label: "ST", x: 35, y: 85 },
      { label: "ST", x: 65, y: 85 },
    ],
  },
  "4-2-3-1": {
    label: "4-2-3-1",
    positions: [
      { label: "GK", x: 50, y: 5 },
      { label: "LB", x: 15, y: 25 },
      { label: "CB", x: 38, y: 25 },
      { label: "CB", x: 62, y: 25 },
      { label: "RB", x: 85, y: 25 },
      { label: "CDM", x: 35, y: 45 },
      { label: "CDM", x: 65, y: 45 },
      { label: "LAM", x: 20, y: 70 },
      { label: "CAM", x: 50, y: 70 },
      { label: "RAM", x: 80, y: 70 },
      { label: "ST", x: 50, y: 90 },
    ],
  },
};

export default function ScoutLineupBuilderPage() {
  const { loading: authLoading } = useAdminAuth("scout");
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;

  const [matches, setMatches] = useState<Match[]>([]);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [homeLineup, setHomeLineup] = useState<LineupData>({ formation: "4-4-2", positions: [] });
  const [awayLineup, setAwayLineup] = useState<LineupData>({ formation: "4-4-2", positions: [] });

const fetchMatchData = useCallback(async () => {
    if (!matchId) return;
    setLoading(true);
    try {
      const [allMatches, match, allPlayers, existingLineups] = await Promise.all([
        adminSelect('matches', {}, { select: 'id, home_team:home_team_id(name), away_team:away_team_id(name), match_date' }),
        adminSelect('matches', { id: matchId }),
        adminSelect('players', {}, { order: { field: 'number', ascending: true } }),
        adminSelect('lineups', { match_id: matchId }),
      ]);

      setMatches((allMatches as unknown as Match[]) || []);
      setCurrentMatch((match as unknown as Match) || null);
      setPlayers((allPlayers as unknown as Player[]) || []);

      const matchData = match as unknown as Match;
      if (!matchData) return;
      const homeL = existingLineups?.find((l: unknown) => (l as unknown as Lineup).team_id === matchData.home_team_id);
      const awayL = existingLineups?.find((l: unknown) => (l as unknown as Lineup).team_id === matchData.away_team_id);

      if (homeL) setHomeLineup({ formation: (homeL as unknown as Lineup).formation, positions: (homeL as unknown as Lineup).positions });
      else setHomeLineup({ formation: "4-4-2", positions: FORMATIONS["4-4-2"].positions.map(p => ({ player_id: "", position_label: p.label, x: p.x, y: p.y })) });

      if (awayL) setAwayLineup({ formation: (awayL as unknown as Lineup).formation, positions: (awayL as unknown as Lineup).positions });
      else setAwayLineup({ formation: "4-4-2", positions: FORMATIONS["4-4-2"].positions.map(p => ({ player_id: "", position_label: p.label, x: p.x, y: p.y })) });

    } catch (e) {
      console.error("Fetch match data error:", e);
      toast.error("Failed to load match data");
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    if (!authLoading) {
      const handleFetch = async () => {
        await fetchMatchData();
      };
      handleFetch();
    }
  }, [authLoading, fetchMatchData]);

  const handleFormationChange = (team: "home" | "away", formation: string) => {
    const config = FORMATIONS[formation];
    const nextLineup = {
      formation,
      positions: config.positions.map(p => ({ player_id: "", position_label: p.label, x: p.x, y: p.y }))
    };
    if (team === "home") setHomeLineup(nextLineup);
    else setAwayLineup(nextLineup);
  };

  const handlePlayerChange = (team: "home" | "away", index: number, playerId: string) => {
    if (team === "home") {
      const next = [...homeLineup.positions];
      next[index].player_id = playerId;
      setHomeLineup({ ...homeLineup, positions: next });
    } else {
      const next = [...awayLineup.positions];
      next[index].player_id = playerId;
      setAwayLineup({ ...awayLineup, positions: next });
    }
  };

  const handleSave = async (team: "home" | "away") => {
    const lineup = team === "home" ? homeLineup : awayLineup;
    const teamId = team === "home" ? currentMatch?.home_team_id : currentMatch?.away_team_id;

    if (lineup.positions.some(p => !p.player_id)) {
      if (!confirm("Some positions are empty. Save anyway?")) return;
    }

    if (!teamId) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/lineup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          match_id: matchId,
          team_id: teamId,
          formation: lineup.formation,
          positions: lineup.positions
        }),
      });

      if (!res.ok) throw new Error("Failed to save lineup");
      toast.success(`${team === "home" ? "Home" : "Away"} lineup saved!`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save lineup";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) return <AdminLayout role="scout"><ShimmerLoader height={600} width="100%" /></AdminLayout>;

  return (
    <AdminLayout role="scout">
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/scout" className="p-2 glass rounded-xl hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Lineup Builder</h1>
              <p className="text-muted-foreground text-sm">Assign players to formations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={matchId}
              onChange={(e) => router.push(`/admin/scout/lineup/${e.target.value}`)}
              className="px-4 py-2 glass rounded-xl outline-none focus:ring-2 focus:ring-primary"
            >
              {matches.map(m => (
                <option key={m.id} value={m.id}>
                  {m.home_team.name} vs {m.away_team.name} ({new Date(m.match_date).toLocaleDateString()})
                </option>
              ))}
            </select>
            <button onClick={fetchMatchData} className="p-2 glass rounded-xl hover:bg-white/10 transition-colors">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <ShimmerLoader height={400} width="100%" />
        ) : !currentMatch ? (
          <div className="text-center py-20 glass rounded-2xl">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold">Match Not Found</h2>
            <p className="text-muted-foreground">Please select a valid match from the dropdown.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Home Team Panel */}
            <TeamLineupPanel
              team="home"
              teamName={currentMatch.home_team.name}
              players={players.filter(p => p.team_id === currentMatch.home_team_id)}
              lineup={homeLineup}
              onFormationChange={(f) => handleFormationChange("home", f)}
              onPlayerChange={(idx, pid) => handlePlayerChange("home", idx, pid)}
              onSave={() => handleSave("home")}
              isSaving={isSaving}
            />

            {/* Away Team Panel */}
            <TeamLineupPanel
              team="away"
              teamName={currentMatch.away_team.name}
              players={players.filter(p => p.team_id === currentMatch.away_team_id)}
              lineup={awayLineup}
              onFormationChange={(f) => handleFormationChange("away", f)}
              onPlayerChange={(idx, pid) => handlePlayerChange("away", idx, pid)}
              onSave={() => handleSave("away")}
              isSaving={isSaving}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

interface TeamLineupPanelProps {
  team: "home" | "away";
  teamName: string;
  players: Player[];
  lineup: LineupData;
  onFormationChange: (formation: string) => void;
  onPlayerChange: (index: number, playerId: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

interface PositionData {
  player_id: string;
  position_label: string;
  x: number;
  y: number;
}

function TeamLineupPanel({ team, teamName, players, lineup, onFormationChange, onPlayerChange, onSave, isSaving }: TeamLineupPanelProps) {
  return (
    <AdminCard className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20 text-primary">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold uppercase tracking-tight">{teamName}</h2>
        </div>
        <select
          value={lineup.formation}
          onChange={(e) => onFormationChange(e.target.value)}
          className="px-3 py-1.5 glass rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
        >
          {Object.keys(FORMATIONS).map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div className="relative aspect-[3/4] bg-green-900/40 rounded-2xl border-2 border-white/10 overflow-hidden shadow-inner">
        {/* Pitch markings */}
        <div className="absolute inset-0 border-2 border-white/10 m-4 rounded-lg" />
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/10 rounded-full" />
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-40 h-20 border-2 border-t-0 border-white/10" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-40 h-20 border-2 border-b-0 border-white/10" />

        {/* Players */}
{lineup.positions.map((pos: PositionData, i: number) => {
           const player = players.find((p: Player) => p.id === pos.player_id);
           return (
             <div
               key={i}
               className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
               style={{ left: `${pos.x}%`, top: team === "home" ? `${100 - pos.y}%` : `${pos.y}%` }}
             >
               <div className="group relative flex flex-col items-center">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg border-2 transition-all ${
                   player ? "bg-primary border-white text-white scale-110" : "bg-white/5 border-white/20 text-muted-foreground border-dashed"
                 }`}>
                   {player ? player.number : pos.position_label}
                 </div>
                {player && (
                  <div className="mt-1 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white truncate max-w-[80px]">
                    {player.name}
                  </div>
                )}
                
                {/* Player Select Overlay */}
                <div className="absolute inset-0 opacity-0 hover:opacity-100 flex items-center justify-center z-10">
                  <select
                    value={pos.player_id}
                    onChange={(e) => onPlayerChange(i, e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  >
                    <option value="">Select Player</option>
                    {players.map((p: Player) => (
                      <option key={p.id} value={p.id}>#{p.number} {p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onSave}
        disabled={isSaving}
        className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        SAVE {team.toUpperCase()} LINEUP
      </button>
    </AdminCard>
  );
}
