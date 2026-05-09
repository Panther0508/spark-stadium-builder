"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminCard } from "@/components/admin/AdminCard";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import { adminSelect, adminUpdate } from "@/app/admin/actions";

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
  const [minute] = useState(0);

  // Filter for scheduled/live matches only
  const activeMatches = matches.filter(m => m.status === "scheduled" || m.status === "live");

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
              <h3 className="font-bold mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button className="py-2 bg-primary/20 rounded-lg text-sm">Home Goal</button>
                <button className="py-2 bg-primary/20 rounded-lg text-sm">Away Goal</button>
                <button className="py-2 bg-yellow-500/20 rounded-lg text-sm">Yellow Card</button>
                <button className="py-2 bg-red-500/20 rounded-lg text-sm">Red Card</button>
              </div>
            </AdminCard>
          </>
        )}
      </div>
    </AdminLayout>
  );
}