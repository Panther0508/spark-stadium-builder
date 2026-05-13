"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState, useEffect, useCallback, Suspense } from "react";
import { Plus, Minus, User, Activity, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { adminSelect } from "@/app/admin/actions";
import { FullScreenOverlay } from "@/components/FullScreenOverlay";
import { useSearchParams } from "next/navigation";

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

type MatchEvent = {
  id: string;
  match_id: string;
  player_id?: string;
  player_name: string;
  type: "goal" | "yellow" | "red" | "sub";
  minute: number;
  created_at: string;
};

export default function LiveScorePage() {
  return (
    <Suspense fallback={
      <AdminLayout role="scout">
        <div className="p-8 text-center glass rounded-2xl border border-white/10 m-6">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold">Loading Scout Console...</h2>
          <p className="text-muted-foreground mt-2">Initializing real-time connection</p>
        </div>
      </AdminLayout>
    }>
      <LiveScoreContent />
    </Suspense>
  );
}

function LiveScoreContent() {
  const { loading } = useAdminAuth("scout");
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const matchIdFromQuery = searchParams.get("matchId");

  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [minute, setMinute] = useState(0);
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: "goal" | "yellow" | "red" | "sub", team: "home" | "away" } | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedMatch || selectedMatch.status !== "live") return;
    
    const calculateMinute = () => {
      const start = new Date(selectedMatch.match_date).getTime();
      const now = Date.now();
      const diff = Math.floor((now - start) / 60000);
      setMinute(Math.max(0, diff));
    };

    calculateMinute();
    const interval = setInterval(calculateMinute, 10000);

    return () => clearInterval(interval);
  }, [selectedMatch]);

  useEffect(() => {
    const fetchMatches = async () => {
      setError(null);
      setLoadingData(true);
      try {
        const data = await adminSelect('matches', {}, {
          select: '*, home_team:home_team_id(name), away_team:away_team_id(name)'
        }) as Match[];
        setMatches(data);
        
        if (matchIdFromQuery) {
          const m = data.find(x => x.id === matchIdFromQuery);
          if (m) setSelectedMatch(m);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch matches";
        setError(message);
        addToast({ type: "error", title: message });
      } finally {
        setLoadingData(false);
      }
    };
    fetchMatches();
  }, [addToast, matchIdFromQuery]);

  useEffect(() => {
    if (!selectedMatch) {
      // Use setImmediate-like behavior to avoid synchronous setState during render
      const timer = setTimeout(() => {
        setPlayers([]);
        setEvents([]);
      }, 0);
      return () => clearTimeout(timer);
    }
    const fetchDetails = async () => {
      try {
        const [playersData, eventsData] = await Promise.all([
          adminSelect('players', {}, { order: { field: 'name' } }) as Promise<Player[]>,
          adminSelect('match_events', { match_id: selectedMatch.id }, { order: { field: 'minute', ascending: false } }) as Promise<MatchEvent[]>,
        ]);
        
        const teamPlayers = playersData.filter(p => 
          p.team_id === selectedMatch.home_team_id || 
          p.team_id === selectedMatch.away_team_id
        );
        setPlayers(teamPlayers);
        setEvents(eventsData);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load details";
        addToast({ type: "error", title: message });
      }
    };
    fetchDetails();
  }, [selectedMatch, addToast]);

  const handleQuickAction = (type: "goal" | "yellow" | "red" | "sub", team: "home" | "away") => {
    setPendingAction({ type, team });
    setShowPlayerModal(true);
  };

  const handleScoreChange = async (team: "home" | "away", increment: boolean) => {
    if (!selectedMatch) return;
    const field = team === "home" ? "home_score" : "away_score";
    const currentValue = (selectedMatch as any)[field] ?? 0;
    const newValue = increment ? currentValue + 1 : Math.max(0, currentValue - 1);
    try {
      const res = await fetch('/api/admin/match-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: selectedMatch.id, [field]: newValue })
      });
      if (!res.ok) throw new Error('Failed to update score');
      setSelectedMatch({ ...selectedMatch, [field]: newValue });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update score";
      setError(message);
      addToast({ type: "error", title: message });
    }
  };

  const logAction = async (player: Player) => {
    if (!selectedMatch || !pendingAction) return;

    try {
      const res = await fetch('/api/admin/match-event-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_id: selectedMatch.id,
          player_id: player.id,
          player_name: player.name,
          type: pendingAction.type,
          minute,
        })
      });
      if (!res.ok) throw new Error('Failed to log action');

      if (pendingAction.type === "goal") {
        await handleScoreChange(pendingAction.team, true);
      }
      
      addToast({ type: "success", title: "Action logged and pending verification" });
      setShowPlayerModal(false);
      setPendingAction(null);
      
      // Refresh events
      const eventsData = await adminSelect('match_events', { match_id: selectedMatch.id }, { order: { field: 'minute', ascending: false } }) as MatchEvent[];
      setEvents(eventsData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to log action";
      setError(message);
      addToast({ type: "error", title: message });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Remove this event? This will NOT update the score automatically.")) return;
    try {
      const res = await fetch('/api/admin/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'match_events', id })
      });
      if (!res.ok) throw new Error('Failed to delete event');
      setEvents(events.filter(e => e.id !== id));
      addToast({ type: "success", title: "Event removed" });
    } catch (err) {
      addToast({ type: "error", title: "Failed to remove event" });
    }
  };

  const activeMatches = matches.filter(m => m.status === "scheduled" || m.status === "live" || m.status === "half-time");

  const handleStatusChange = async (newStatus: "live" | "half-time" | "finished") => {
    if (!selectedMatch) return;
    if (!confirm(`Change match status to ${newStatus}?`)) return;
    try {
      const res = await fetch('/api/admin/match-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: selectedMatch.id, status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      setSelectedMatch({ ...selectedMatch, status: newStatus });
      addToast({ type: "success", title: `Match set to ${newStatus}` });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update status";
      setError(message);
      addToast({ type: "error", title: message });
    }
  };

   const handleRetry = async () => {
     setError(null);
     setLoadingData(true);
     try {
       const data = await adminSelect('matches', {}, {
         select: '*, home_team:home_team_id(name), away_team:away_team_id(name)'
       }) as Match[];
       setMatches(data);
     } catch (err) {
       const message = err instanceof Error ? err.message : "Failed to fetch matches";
       setError(message);
       addToast({ type: "error", title: message });
     } finally {
       setLoadingData(false);
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

  if (error) {
    return (
      <AdminLayout role="scout">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Live Score Entry</h1>
            <div className="flex gap-2">
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading live data</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout role="scout">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Live Score Entry</h1>

        <div className="glass rounded-xl p-4 border border-white/20 backdrop-blur-xl">
          <label className="text-sm font-medium mb-2 block">Select Match</label>
          <select
            value={selectedMatch?.id || ""}
            onChange={e => {
              const m = matches.find(x => x.id === e.target.value);
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
        </div>

        {selectedMatch && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="glass rounded-xl p-4 border border-white/20 backdrop-blur-xl">
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
                        className="p-4 glass rounded-xl hover:bg-white/20 min-h-[44px] border border-white/20"
                      >
                        <Minus className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => handleScoreChange("home", true)}
                        className="p-4 glass rounded-xl hover:bg-white/20 min-h-[44px] border border-white/20"
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
                        className="p-4 glass rounded-xl hover:bg-white/20 min-h-[44px] border border-white/20"
                      >
                        <Minus className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => handleScoreChange("away", true)}
                        className="p-4 glass rounded-xl hover:bg-white/20 min-h-[44px] border border-white/20"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl p-4 border border-white/20 backdrop-blur-xl">
                <h3 className="font-bold mb-3">Match Lifecycle</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleStatusChange("live")} 
                    disabled={selectedMatch.status === "live"}
                    className="flex-1 min-h-[44px] py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-bold disabled:opacity-50 border border-white/20"
                  >
                    Start Match
                  </button>
                  <button 
                    onClick={() => handleStatusChange("half-time")} 
                    disabled={selectedMatch.status === "half-time"}
                    className="flex-1 min-h-[44px] py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-bold disabled:opacity-50 border border-white/20"
                  >
                    Half-Time
                  </button>
                  <button 
                    onClick={() => handleStatusChange("finished")} 
                    className="flex-1 min-h-[44px] py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-bold border border-white/20"
                  >
                    Full-Time
                  </button>
                </div>
              </div>

              <div className="glass rounded-xl p-4 border border-white/20 backdrop-blur-xl">
                <h3 className="font-bold mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button onClick={() => handleQuickAction("goal", "home")} className="min-h-[44px] py-2 bg-primary/20 rounded-lg text-sm border border-white/20">Home Goal</button>
                  <button onClick={() => handleQuickAction("goal", "away")} className="min-h-[44px] py-2 bg-primary/20 rounded-lg text-sm border border-white/20">Away Goal</button>
                  <button onClick={() => handleQuickAction("yellow", "home")} className="min-h-[44px] py-2 bg-yellow-500/20 rounded-lg text-sm border border-white/20">Home Yellow</button>
                  <button onClick={() => handleQuickAction("red", "home")} className="min-h-[44px] py-2 bg-red-500/20 rounded-lg text-sm border border-white/20">Home Red</button>
                  <button onClick={() => handleQuickAction("yellow", "away")} className="min-h-[44px] py-2 bg-yellow-500/20 rounded-lg text-sm border border-white/20">Away Yellow</button>
                  <button onClick={() => handleQuickAction("red", "away")} className="min-h-[44px] py-2 bg-red-500/20 rounded-lg text-sm border border-white/20">Away Red</button>
                  <button onClick={() => handleQuickAction("sub", "home")} className="min-h-[44px] py-2 bg-blue-500/20 rounded-lg text-sm border border-white/20">Home Sub</button>
                  <button onClick={() => handleQuickAction("sub", "away")} className="min-h-[44px] py-2 bg-blue-500/20 rounded-lg text-sm border border-white/20">Away Sub</button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass rounded-xl p-4 border border-white/20 backdrop-blur-xl">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Match Timeline
                </h3>
                {events.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground text-sm">No events logged yet.</p>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {events.map((event) => (
                      <div key={event.id} className="flex items-center gap-3 p-3 glass rounded-lg border border-white/10 group">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          event.type === 'goal' ? 'bg-primary/20 text-primary' :
                          event.type === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                          event.type === 'red' ? 'bg-red-500/20 text-red-400' : 'bg-white/10'
                        }`}>
                          {event.minute}&apos;
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{event.player_name}</div>
                          <div className="text-[10px] text-muted-foreground uppercase">{event.type}</div>
                        </div>
                        <button 
                          onClick={() => handleDeleteEvent(event.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Undo / Delete"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!selectedMatch && activeMatches.length === 0 && (
          <div className="glass rounded-xl p-8 text-center border border-white/20 backdrop-blur-xl">
            <div className="flex-shrink-0">
              <svg className="h-10 w-10 text-muted-foreground mx-auto" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-muted-foreground">No active matches</h3>
              <p className="text-sm text-muted-foreground mt-2">
                No scheduled, live, or half-time matches found.
              </p>
            </div>
          </div>
        )}

        <FullScreenOverlay
          isOpen={showPlayerModal}
          onClose={() => setShowPlayerModal(false)}
        >
          <div className="space-y-4">
            <h2 className="text-xl font-bold capitalize">Select Player for {pendingAction?.type}</h2>
            <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
               {players.length === 0 ? (
                 <p className="text-sm text-muted-foreground py-4">No players found for this team.</p>
               ) : (
                 players.map(player => (
                  <button
                    key={player.id}
                    onClick={() => logAction(player)}
                    className="w-full flex items-center gap-3 p-3 glass rounded-xl hover:bg-white/10 transition-colors text-left border border-white/20"
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
              className="w-full min-h-[44px] py-2 glass rounded-lg border border-white/20 mt-4"
            >
              Cancel
            </button>
          </div>
        </FullScreenOverlay>
      </div>
    </AdminLayout>
  );
}
