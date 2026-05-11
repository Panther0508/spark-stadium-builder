"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminCard } from "@/components/admin/AdminCard";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState, useEffect } from "react";
import { Plus, Minus, User } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { adminSelect, adminUpdate, adminInsert } from "@/app/admin/actions";
import { FullScreenOverlay } from "@/components/FullScreenOverlay";

type Match = {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score?: number;
  away_score?: number;
  status: string;
  match_date: string;
  home_team?: { name: string };
  away_team?: { name: string };
};

type Player = {
  id: string;
  name: string;
  team_id: string;
  number: number;
};

export default function LiveScorePage() {
  const { loading } = useAdminAuth("scout");
  const { addToast } = useToast();

  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [minute, setMinute] = useState(0);
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: "goal" | "yellow" | "red", team: "home" | "away" } | null>(null);

  // Auto-calculate minute from match_date if live
  useEffect(() => {
    if (!selectedMatch || selectedMatch.status !== "live") return;
    
    const interval = setInterval(() => {
      const start = new Date(selectedMatch.match_date).getTime();
      const now = Date.now();
      const diff = Math.floor((now - start) / 60000);
      setMinute(Math.max(0, diff));
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedMatch]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await adminSelect('matches', {}, {
          select: '*, home_team:home_team_id(name), away_team:away_team_id(name)'
        }) as Match[];
        setMatches(data);
      } catch (err) {
        console.error('Failed to fetch matches:', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchMatches();
  }, []);

  useEffect(() => {
    if (!selectedMatch) {
      setPlayers([]);
      return;
    }
    const fetchPlayers = async () => {
      const data = await adminSelect('players', {
        // We can't easily do OR filters in adminSelect match currently, 
        // so we fetch all and filter or just fetch all verified players.
      }, { order: { field: 'name' } }) as Player[];
      
      const teamPlayers = data.filter(p => 
        p.team_id === selectedMatch.home_team_id || 
        p.team_id === selectedMatch.away_team_id
      );
      setPlayers(teamPlayers);
    };
    fetchPlayers();
  }, [selectedMatch]);

  const handleQuickAction = (type: "goal" | "yellow" | "red", team: "home" | "away") => {
    setPendingAction({ type, team });
    setShowPlayerModal(true);
  };

  const logAction = async (player: Player) => {
    if (!selectedMatch || !pendingAction) return;

    try {
      await adminInsert("match_events", {
        match_id: selectedMatch.id,
        player_id: player.id,
        player_name: player.name,
        type: pendingAction.type,
        minute,
        is_verified: false,
      });

      if (pendingAction.type === "goal") {
        await handleScoreChange(pendingAction.team, true);
      }
      addToast({ type: "success", title: "Action logged and pending verification" });
      setShowPlayerModal(false);
      setPendingAction(null);
    } catch (err) {
      console.error("Action log error:", err);
      addToast({ type: "error", title: "Failed to log action" });
    }
  };

  // Filter for scheduled/live matches only
  const activeMatches = matches.filter(m => m.status === "scheduled" || m.status === "live");

  const handleStatusChange = async (newStatus: "live" | "half-time" | "finished") => {
    if (!selectedMatch) return;
    if (!confirm(`Change match status to ${newStatus}?`)) return;
    try {
      await adminUpdate('matches', { id: selectedMatch.id }, { status: newStatus });
      setSelectedMatch({ ...selectedMatch, status: newStatus });
      addToast({ type: "success", title: `Match set to ${newStatus}` });
    } catch {
      addToast({ type: "error", title: "Failed to update status" });
    }
  };

  const handleScoreChange = async (team: "home" | "away", increment: boolean) => {
    if (!selectedMatch) return;
    const field = team === "home" ? "home_score" : "away_score";
    const currentValue = selectedMatch[field] ?? 0;
    const newValue = increment ? currentValue + 1 : Math.max(0, currentValue - 1);
    try {
      await adminUpdate('matches', { id: selectedMatch.id }, { [field]: newValue });
      setSelectedMatch({ ...selectedMatch, [field]: newValue });
    } catch (err) {
      console.error('Failed to update score:', err);
    }
  };

  if (loading || loadingData) {
    return (
      <AdminLayout role="scout">
        <div className="space-y-4">
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminLayout>
    );
  }

  const teamIdToFilter = pendingAction?.team === "home" ? selectedMatch?.home_team_id : selectedMatch?.away_team_id;
  const filteredPlayers = players.filter(p => p.team_id === teamIdToFilter);

  return (
    <AdminLayout role="scout">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Live Score Entry</h1>

        <AdminCard className="p-6">
          <label className="text-sm font-medium mb-2 block">Select Match</label>
          <select
            value={selectedMatch?.id || ""}
            onChange={e => {
              const m = activeMatches.find(x => x.id === e.target.value);
              setSelectedMatch(m || null);
            }}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 mb-4"
          >
            <option value="">Choose a match</option>
            {activeMatches.map(m => (
              <option key={m.id} value={m.id}>
                {m.home_team?.name} vs {m.away_team?.name}
              </option>
            ))}
          </select>
        </AdminCard>

        {selectedMatch && (
          <>
            <AdminCard className="p-6">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold mb-2">
                  {selectedMatch.home_team?.name} <span className="text-primary">{selectedMatch.home_score}</span> : <span className="text-primary">{selectedMatch.away_score}</span> {selectedMatch.away_team?.name}
                </div>
                <div className="text-lg">Minute: {minute}</div>
              </div>

              <div className="flex justify-center gap-8">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs text-muted-foreground">Home</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleScoreChange("home", false)}
                      className="p-4 glass rounded-lg hover:bg-white/20 min-h-[44px]"
                    >
                      <Minus className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => handleScoreChange("home", true)}
                      className="p-4 glass rounded-lg hover:bg-white/20 min-h-[44px]"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs text-muted-foreground">Away</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleScoreChange("away", false)}
                      className="p-4 glass rounded-lg hover:bg-white/20 min-h-[44px]"
                    >
                      <Minus className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => handleScoreChange("away", true)}
                      className="p-4 glass rounded-lg hover:bg-white/20 min-h-[44px]"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </AdminCard>

            <AdminCard className="p-6">
              <h3 className="font-bold mb-3">Match Lifecycle</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleStatusChange("live")} 
                  disabled={selectedMatch.status === "live"}
                  className="flex-1 min-h-[44px] py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-bold disabled:opacity-50"
                >
                  Start Match
                </button>
                <button 
                  onClick={() => handleStatusChange("half-time")} 
                  disabled={selectedMatch.status === "half-time"}
                  className="flex-1 min-h-[44px] py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-bold disabled:opacity-50"
                >
                  Half-Time
                </button>
                <button 
                  onClick={() => handleStatusChange("finished")} 
                  className="flex-1 min-h-[44px] py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-bold"
                >
                  Full-Time
                </button>
              </div>
            </AdminCard>

            <AdminCard className="p-6">
              <h3 className="font-bold mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button onClick={() => handleQuickAction("goal", "home")} className="min-h-[44px] py-2 bg-primary/20 rounded-lg text-sm">Home Goal</button>
                <button onClick={() => handleQuickAction("goal", "away")} className="min-h-[44px] py-2 bg-primary/20 rounded-lg text-sm">Away Goal</button>
                <button onClick={() => handleQuickAction("yellow", "home")} className="min-h-[44px] py-2 bg-yellow-500/20 rounded-lg text-sm">Home Yellow</button>
                <button onClick={() => handleQuickAction("red", "home")} className="min-h-[44px] py-2 bg-red-500/20 rounded-lg text-sm">Home Red</button>
                <button onClick={() => handleQuickAction("yellow", "away")} className="min-h-[44px] py-2 bg-yellow-500/20 rounded-lg text-sm">Away Yellow</button>
                <button onClick={() => handleQuickAction("red", "away")} className="min-h-[44px] py-2 bg-red-500/20 rounded-lg text-sm">Away Red</button>
              </div>
            </AdminCard>

            <FullScreenOverlay
              isOpen={showPlayerModal}
              onClose={() => setShowPlayerModal(false)}
            >
              <div className="space-y-4">
                <h2 className="text-xl font-bold capitalize">Select Player for {pendingAction?.type}</h2>
                <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto">
                  {filteredPlayers.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">No players found for this team.</p>
                  ) : (
                    filteredPlayers.map(player => (
                      <button
                        key={player.id}
                        onClick={() => logAction(player)}
                        className="flex items-center gap-3 p-3 glass rounded-xl hover:bg-white/10 transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{player.name}</div>
                          <div className="text-xs text-muted-foreground">#{player.number}</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <button
                  onClick={() => setShowPlayerModal(false)}
                  className="w-full min-h-[44px] py-2 glass rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </FullScreenOverlay>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
