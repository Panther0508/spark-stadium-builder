"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";

type Match = {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score?: number;
  away_score?: number;
  status: string;
  match_date: string;
  venue?: string;
  image_url?: string;
  is_verified?: boolean;
  community_visible?: boolean;
  home_team?: { name: string };
  away_team?: { name: string };
  duration_minutes?: number; // Optional, might be stored in admin_post or a new column
};

export default function VerifierOverride() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [matchData, setMatchData] = useState<Match | null>(null);
  const [formData, setFormData] = useState({
    match_date: "",
    duration_minutes: "",
    status: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleSave = async () => {
    if (!selectedMatchId) return;
    try {
      const res = await fetch("/api/admin/match-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: selectedMatchId,
          match_date: formData.match_date ? new Date(formData.match_date).toISOString() : undefined,
          duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes, 10) : undefined,
          status: formData.status || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to update match");
      addToast({ type: "success", title: "Match updated successfully" });
      const res2 = await fetch(`/api/admin/matches`, { method: "GET" });
      if (res2.ok) setMatches(await res2.json());
      // Clear selection
      setSelectedMatchId(null);
      setMatchData(null);
      setFormData({ match_date: "", duration_minutes: "", status: "" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save match";
      setError(message);
      addToast({ type: "error", title: message });
    }
  };

  const loadMatches = async () => {
    const res = await fetch(`/api/admin/matches`, { method: "GET" });
    if (!res.ok) throw new Error("Failed to fetch matches");
    return res.json();
  };

   useEffect(() => {
    const handleFetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/matches`, { method: "GET" });
        if (!res.ok) throw new Error("Failed to fetch matches");
        const data: Match[] = await res.json();
        setMatches(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        addToast({ type: "error", title: message });
      } finally {
        setLoading(false);
      }
    };
    handleFetch();
  }, [addToast]);

useEffect(() => {
     if (selectedMatchId) {
       const handleFetchDetails = async () => {
         try {
           const res = await fetch(`/api/admin/matches/${selectedMatchId}`, {
             method: "GET",
           });
           if (!res.ok) throw new Error("Failed to fetch match details");
           const data: Match = await res.json();
           setMatchData(data);
           setFormData({
             match_date: data.match_date ? new Date(data.match_date).toISOString().slice(0, 16) : "",
             duration_minutes: data.duration_minutes ? String(data.duration_minutes) : "",
             status: data.status || "",
           });
         } catch (err) {
           const message = err instanceof Error ? err.message : "Failed to load match details";
           setError(message);
           addToast({ type: "error", title: message });
         }
       };
       handleFetchDetails();
     }
   }, [selectedMatchId, addToast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-medium text-muted-foreground">Loading matches...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
<button
                 onClick={() => loadMatches().then(setMatches).catch(() => {})}
                 className="mt-3 px-3 py-1.5 text-sm font-medium bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
               >
                 Retry
               </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manual Match Override</h1>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Match Selector */}
        <div className="glass rounded-xl p-4 border border-white/10">
          <h2 className="text-xl font-bold mb-4">Select Match</h2>
          <div className="space-y-3">
            <label className="block text-sm font-medium mb-2">Match</label>
            <select
              value={selectedMatchId || ""}
              onChange={e => setSelectedMatchId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20"
            >
              <option value="">Select a match</option>
              {matches.map(match => (
                <option key={match.id} value={match.id}>
                  {(match.home_team?.name || "TBD")} vs {(match.away_team?.name || "TBD")} - {new Date(match.match_date).toLocaleString()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Match Details and Editor */}
        {matchData && (
          <div className="glass rounded-xl p-4 border border-white/10">
            <h2 className="text-xl font-bold mb-4">Edit Match Details</h2>
            <div className="space-y-4">
              {/* Current Match Info */}
              <div className="text-muted-foreground">
                <p><strong>Match:</strong> {matchData.home_team?.name || "TBD"} vs {matchData.away_team?.name || "TBD"}</p>
                <p><strong>Current Date:</strong> {new Date(matchData.match_date).toLocaleString()}</p>
                <p><strong>Current Status:</strong> {matchData.status}</p>
                <p><strong>Current Duration:</strong> {matchData.duration_minutes ? `${matchData.duration_minutes} minutes` : "Not set"}</p>
              </div>

              {/* Edit Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Match Date</label>
                  <input
                    type="datetime-local"
                    value={formData.match_date}
                    onChange={e => setFormData({ ...formData, match_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={e => setFormData({ ...formData, duration_minutes: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20"
                  >
                    <option value="">Select status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live</option>
                    <option value="half_time">Half-Time</option>
                    <option value="finished">Finished</option>
                  </select>
                </div>

                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}