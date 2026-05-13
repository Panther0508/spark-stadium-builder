"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminCard } from "@/components/admin/AdminCard";
import { Skeleton } from "@/components/Skeleton";
import { AlertCircle, Save, RefreshCw, Calendar, Clock, History } from "lucide-react";

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
  duration_minutes?: number; 
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
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  const handleSave = async () => {
    if (!selectedMatchId) return;
    setIsSaving(true);
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
      
      // Refresh list
      const res2 = await fetch(`/api/admin/matches`);
      if (res2.ok) setMatches(await res2.json());
      
      setSelectedMatchId(null);
      setMatchData(null);
    } catch (err) {
      addToast({ type: "error", title: "Failed to save changes" });
    } finally {
      setIsSaving(false);
    }
  };

   useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/matches`);
        if (!res.ok) throw new Error("Failed to fetch matches");
        const data: Match[] = await res.json();
        setMatches(data);
      } catch (err) {
        addToast({ type: "error", title: "Error loading matches" });
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [addToast]);

  useEffect(() => {
     if (selectedMatchId) {
       const fetchDetails = async () => {
         try {
           const res = await fetch(`/api/admin/matches/${selectedMatchId}`);
           if (!res.ok) throw new Error("Failed to fetch details");
           const data: Match = await res.json();
           setMatchData(data);
           setFormData({
             match_date: data.match_date ? new Date(data.match_date).toISOString().slice(0, 16) : "",
             duration_minutes: data.duration_minutes ? String(data.duration_minutes) : "",
             status: data.status || "",
           });
         } catch (err) {
           addToast({ type: "error", title: "Failed to load match details" });
         }
       };
       fetchDetails();
     }
   }, [selectedMatchId, addToast]);

  if (loading) {
    return (
      <AdminLayout role="verifier">
        <Skeleton className="h-64 w-full" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout role="verifier">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Manual Match Override</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of matches */}
          <AdminCard className="lg:col-span-1 flex flex-col h-[600px]">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-bold flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                Select Match
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
              {matches.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMatchId(m.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    selectedMatchId === m.id ? "bg-primary/10 border-primary" : "glass border-white/5 hover:bg-white/5"
                  }`}
                >
                  <div className="text-xs font-bold uppercase text-primary mb-1">{m.status}</div>
                  <div className="font-medium text-sm">
                    {m.home_team?.name} vs {m.away_team?.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {new Date(m.match_date).toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </AdminCard>

          {/* Editor */}
          <AdminCard className="lg:col-span-2">
            {!selectedMatchId ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg">No Match Selected</h3>
                <p className="text-sm max-w-xs mt-2">Select a match from the left panel to override its properties.</p>
              </div>
            ) : !matchData ? (
              <div className="p-8 space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h2 className="text-xl font-bold">Edit Match Properties</h2>
                  <div className="text-xs bg-white/10 px-2 py-1 rounded">ID: {matchData.id.slice(0, 8)}...</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Match Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.match_date}
                      onChange={e => setFormData({ ...formData, match_date: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.duration_minutes}
                      onChange={e => setFormData({ ...formData, duration_minutes: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary outline-none"
                      placeholder="e.g. 90"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                      <RefreshCw className="w-3 h-3" /> Match Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary outline-none"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="live">Live</option>
                      <option value="half-time">Half-Time</option>
                      <option value="finished">Finished</option>
                    </select>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-200/80 leading-relaxed">
                    Override changes are applied immediately to the production database. 
                    Changing status to &quot;finished&quot; will trigger standings recalculation if the match is verified.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => { setSelectedMatchId(null); setMatchData(null); }}
                    className="flex-1 py-3 glass hover:bg-white/10 rounded-xl font-bold transition-all border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Override
                  </button>
                </div>
              </div>
            )}
          </AdminCard>
        </div>
      </div>
    </AdminLayout>
  );
}
