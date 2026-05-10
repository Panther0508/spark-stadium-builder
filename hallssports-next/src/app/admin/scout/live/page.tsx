"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminCard } from "@/components/admin/AdminCard";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import { adminSelect, adminUpdate, adminInsert } from "@/app/admin/actions";

type Match = {
  id: string;
  home_team: string;
  away_team: string;
  home_score?: number;
  away_score?: number;
  status: string;
  match_date: string;
};

export default function LiveScorePage() {
  const { loading } = useAdminAuth("scout");

  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [minute, setMinute] = useState(0);

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

  const handleQuickAction = async (type: "goal" | "yellow" | "red", team: "home" | "away") => {
    if (!selectedMatch) return;
    const playerName = prompt(`Enter player name for ${type}:`);
    if (!playerName) return;

    try {
      await adminInsert("match_events", {
        match_id: selectedMatch.id,
        type,
        player_name: playerName,
        minute,
        team: team === "home" ? selectedMatch.home_team : selectedMatch.away_team,
        is_verified: false,
      });

      if (type === "goal") {
        await handleScoreChange(team, true);
      }
      alert("Action logged and pending verification.");
    } catch (err) {
      console.error("Action log error:", err);
    }
  };

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await adminSelect('matches') as Match[];
        setMatches(data);
      } catch (err) {
        console.error('Failed to fetch matches:', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchMatches();
  }, []);

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
                {m.home_team} vs {m.away_team}
              </option>
            ))}
          </select>
        </AdminCard>

        {selectedMatch && (
          <>
            <AdminCard className="p-6">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold mb-2">
                  {selectedMatch.home_team} <span className="text-primary">{selectedMatch.home_score}</span> : <span className="text-primary">{selectedMatch.away_score}</span> {selectedMatch.away_team}
                </div>
                <div className="text-lg">Minute: {minute}</div>
              </div>

              <div className="flex justify-center gap-8">
                <button
                  onClick={() => handleScoreChange("home", false)}
                  className="p-4 glass rounded-lg hover:bg-white/20"
                >
                  <Minus className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handleScoreChange("home", true)}
                  className="p-4 glass rounded-lg hover:bg-white/20"
                >
                  <Plus className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handleScoreChange("away", false)}
                  className="p-4 glass rounded-lg hover:bg-white/20"
                >
                  <Minus className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handleScoreChange("away", true)}
                  className="p-4 glass rounded-lg hover:bg-white/20"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </AdminCard>

            <AdminCard className="p-6">
              <h3 className="font-bold mb-3">Match Lifecycle</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleStatusChange("live")} 
                  disabled={selectedMatch.status === "live"}
                  className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-bold disabled:opacity-50"
                >
                  Start Match
                </button>
                <button 
                  onClick={() => handleStatusChange("half-time")} 
                  disabled={selectedMatch.status === "half-time"}
                  className="flex-1 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-bold disabled:opacity-50"
                >
                  Half-Time
                </button>
                <button 
                  onClick={() => handleStatusChange("finished")} 
                  className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-bold"
                >
                  Full-Time
                </button>
              </div>
            </AdminCard>

            <AdminCard className="p-6">
              <h3 className="font-bold mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button onClick={() => handleQuickAction("goal", "home")} className="py-2 bg-primary/20 rounded-lg text-sm">Home Goal</button>
                <button onClick={() => handleQuickAction("goal", "away")} className="py-2 bg-primary/20 rounded-lg text-sm">Away Goal</button>
                <button onClick={() => handleQuickAction("yellow", "home")} className="py-2 bg-yellow-500/20 rounded-lg text-sm">Home Yellow</button>
                <button onClick={() => handleQuickAction("red", "home")} className="py-2 bg-red-500/20 rounded-lg text-sm">Home Red</button>
                <button onClick={() => handleQuickAction("yellow", "away")} className="py-2 bg-yellow-500/20 rounded-lg text-sm">Away Yellow</button>
                <button onClick={() => handleQuickAction("red", "away")} className="py-2 bg-red-500/20 rounded-lg text-sm">Away Red</button>
              </div>
            </AdminCard>
          </>
        )}
      </div>
    </AdminLayout>
  );
}