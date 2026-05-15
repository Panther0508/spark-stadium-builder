"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminCard } from "@/components/admin/AdminCard";
import { Skeleton } from "@/components/Skeleton";
import { AlertCircle, Save, RefreshCw, Calendar, Clock, History, Plus } from "lucide-react";

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

type Standing = {
  id: string;
  team_id: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
  teams?: { name: string };
};

export default function VerifierOverride() {
  const [activeTab, setActiveTab] = useState<"matches" | "standings">("matches");
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [teams, setTeams] = useState<Array<{ id: string; name: string }>>([]);
  const [newStandingTeamId, setNewStandingTeamId] = useState("");
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

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [res, sRes] = await Promise.all([
          fetch(`/api/admin/matches`),
          fetch(`/api/admin/standings`)
        ]);
        
        if (res.ok) setMatches(await res.json());
        if (sRes.ok) setStandings(await sRes.json());
      } catch {
        addToast({ type: "error", title: "Failed to load data" });
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [addToast]);

  const handleMatchSave = async () => {
    if (!selectedMatchId) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/update-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedMatchId,
          match_date: formData.match_date ? new Date(formData.match_date).toISOString() : undefined,
          duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes, 10) : undefined,
          status: formData.status || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to update match");
      addToast({ type: "success", title: "Match updated successfully" });
      
      const res2 = await fetch(`/api/admin/matches`);
      if (res2.ok) setMatches(await res2.json());
      
      setSelectedMatchId(null);
      setMatchData(null);
    } catch (_err) {
      addToast({ type: "error", title: "Failed to save changes" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStandingUpdate = async (standing: Standing, field: keyof Standing, value: number) => {
    try {
      const res = await fetch("/api/admin/update-standings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: standing.id,
          [field]: value
        }),
      });
      if (!res.ok) throw new Error("Failed to update standing");
      
      setStandings(prev => prev.map(s => s.id === standing.id ? { ...s, [field]: value } : s));
      addToast({ type: "success", title: "Standing updated" });
    } catch {
      addToast({ type: "error", title: "Update failed" });
    }
  };

  const handleAddStanding = async () => {
    if (!newStandingTeamId) return;
    try {
      const res = await fetch("/api/admin/update-standings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_id: newStandingTeamId,
          played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, points: 0
        }),
      });
      if (!res.ok) throw new Error("Failed to add team");
      addToast({ type: "success", title: "Team added to standings" });
      setNewStandingTeamId("");
      const sRes = await fetch(`/api/admin/standings`);
      if (sRes.ok) setStandings(await sRes.json());
    } catch {
      addToast({ type: "error", title: "Add failed" });
    }
  };

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Verifier Overrides</h1>
          </div>
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
            <button 
              onClick={() => setActiveTab("matches")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "matches" ? "bg-primary text-white" : "hover:bg-white/5"}`}
            >
              Matches
            </button>
            <button 
              onClick={() => setActiveTab("standings")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "standings" ? "bg-primary text-white" : "hover:bg-white/5"}`}
            >
              Standings
            </button>
          </div>
        </div>

        {activeTab === "matches" ? (
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
                      Override changes are applied immediately. 
                      Setting status to &quot;finished&quot; triggers standings recalculation if verified.
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
                      onClick={handleMatchSave}
                      disabled={isSaving}
                      className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Match Override
                    </button>
                  </div>
                </div>
              )}
            </AdminCard>
          </div>
        ) : (
          <AdminCard className="p-6">
            <div className="flex gap-2 mb-6 p-4 bg-white/5 rounded-xl border border-white/10 items-end">
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Add Team to Standings</label>
                <select
                  value={newStandingTeamId}
                  onChange={e => setNewStandingTeamId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg glass border border-white/10 outline-none"
                >
                  <option value="">Select team</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <button
                onClick={handleAddStanding}
                disabled={!newStandingTeamId}
                className="px-4 py-2.5 bg-primary text-white rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="px-4 py-3 font-bold">Team</th>
                    <th className="px-2 py-3 text-center">P</th>
                    <th className="px-2 py-3 text-center">W</th>
                    <th className="px-2 py-3 text-center">D</th>
                    <th className="px-2 py-3 text-center">L</th>
                    <th className="px-2 py-3 text-center">GF</th>
                    <th className="px-2 py-3 text-center">GA</th>
                    <th className="px-2 py-3 text-center">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {standings.map((s: Standing) => (
                    <tr key={s.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-bold">{s.teams?.name}</td>
                      <td className="px-2 py-3">
                        <input 
                          type="number" 
                          value={s.played} 
                          onChange={e => handleStandingUpdate(s, 'played', parseInt(e.target.value))}
                          className="w-12 bg-white/5 border border-white/10 rounded px-1 text-center py-1 outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input 
                          type="number" 
                          value={s.wins} 
                          onChange={e => handleStandingUpdate(s, 'wins', parseInt(e.target.value))}
                          className="w-12 bg-white/5 border border-white/10 rounded px-1 text-center py-1 outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input 
                          type="number" 
                          value={s.draws} 
                          onChange={e => handleStandingUpdate(s, 'draws', parseInt(e.target.value))}
                          className="w-12 bg-white/5 border border-white/10 rounded px-1 text-center py-1 outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input 
                          type="number" 
                          value={s.losses} 
                          onChange={e => handleStandingUpdate(s, 'losses', parseInt(e.target.value))}
                          className="w-12 bg-white/5 border border-white/10 rounded px-1 text-center py-1 outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input 
                          type="number" 
                          value={s.goals_for} 
                          onChange={e => handleStandingUpdate(s, 'goals_for', parseInt(e.target.value))}
                          className="w-12 bg-white/5 border border-white/10 rounded px-1 text-center py-1 outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input 
                          type="number" 
                          value={s.goals_against} 
                          onChange={e => handleStandingUpdate(s, 'goals_against', parseInt(e.target.value))}
                          className="w-12 bg-white/5 border border-white/10 rounded px-1 text-center py-1 outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input 
                          type="number" 
                          value={s.points} 
                          onChange={e => handleStandingUpdate(s, 'points', parseInt(e.target.value))}
                          className="w-12 bg-primary/10 border border-primary/30 rounded px-1 text-center py-1 outline-none text-primary font-bold"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-8 bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-200/80 leading-relaxed">
                <strong>WARNING:</strong> Direct standings override bypasses automatic calculations. 
                Values entered here will be overwritten if a match is subsequently verified, unless you disable the trigger (not recommended).
              </p>
            </div>
          </AdminCard>
        )}
      </div>
    </AdminLayout>
  );
}
