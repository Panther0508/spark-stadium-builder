"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminModal, AdminFormField } from "@/components/admin";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { adminSelect } from "@/app/admin/actions";
import ImageUpload from "@/components/admin/ImageUpload";

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
  featured?: boolean;
  community_visible?: boolean;
  home_team?: { name: string };
  away_team?: { name: string };
};

type Team = { id: string; name: string };

export default function MatchesPage() {
  const { loading } = useAdminAuth("scout");
  const { addToast } = useToast();
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "scheduled" | "live" | "finished" | "pending">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [formData, setFormData] = useState({
    home_team_id: "",
    away_team_id: "",
    match_date: "",
    venue: "",
    image_url: "",
    featured: false,
    community_visible: false,
  });

const fetchData = useCallback(async () => {
    setError(null);
    setLoadingData(true);
    try {
      const [matchesData, teamsData] = await Promise.all([
        adminSelect('matches', {}, { 
          select: '*, home_team:home_team_id(name), away_team:away_team_id(name)',
          order: { field: 'match_date', ascending: false } 
        }) as Promise<Match[]>,
        adminSelect('teams') as Promise<Team[]>,
      ]);
      return { matchesData, teamsData };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoadingData(false);
    }
  }, [setError, setLoadingData]);

useEffect(() => {
    let isMounted = true;
    const handleFetch = async () => {
      try {
        const { matchesData, teamsData } = await fetchData();
        if (isMounted) {
          setMatches(matchesData);
          setTeams(teamsData || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load data");
          addToast({ type: "error", title: err instanceof Error ? err.message : "Failed to load data" });
        }
      }
    };
    handleFetch();
    return () => {
      isMounted = false;
    };
  }, [fetchData, addToast]);

  const filteredMatches = matches.filter(m => {
    if (filter === "all") return true;
    if (filter === "pending") return !m.is_verified;
    return m.status === filter;
  });

  const handleSave = async () => {
    try {
      if (!formData.home_team_id || !formData.away_team_id || !formData.match_date) {
        throw new Error("Missing required fields");
      }

      const data = {
        home_team_id: formData.home_team_id,
        away_team_id: formData.away_team_id,
        match_date: new Date(formData.match_date).toISOString(),
        venue: formData.venue,
        image_url: formData.image_url,
        featured: formData.featured,
        community_visible: formData.community_visible,
      };

      if (editingMatch) {
        const res = await fetch('/api/admin/match-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matchId: editingMatch.id, ...data })
        });
        if (!res.ok) throw new Error('Update failed');
        addToast({ type: "success", title: "Match updated" });
      } else {
        const res = await fetch('/api/admin/match-create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Create failed');
        addToast({ type: "success", title: "Match created" });
      }
      
      setModalOpen(false);
      setEditingMatch(null);
      setFormData({ home_team_id: "", away_team_id: "", match_date: "", venue: "", image_url: "", featured: false, community_visible: false });
      fetchData().then(({ matchesData, teamsData }) => {
        setMatches(matchesData);
        setTeams(teamsData || []);
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save match";
      setError(message);
      addToast({ type: "error", title: message });
    }
  };

   const handleEdit = (match: Match) => {
     setEditingMatch(match);
     setFormData({
       home_team_id: match.home_team_id,
       away_team_id: match.away_team_id,
       match_date: new Date(match.match_date).toISOString().slice(0, 16),
       venue: match.venue || "",
       image_url: match.image_url || "",
       featured: match.featured || false,
       community_visible: match.community_visible || false,
     });
     setModalOpen(true);
   };

   const handleRetry = () => {
     setError(null);
     setLoadingData(true);
     fetchData()
       .then(({ matchesData, teamsData }) => {
         setMatches(matchesData);
         setTeams(teamsData || []);
         setError(null);
         setLoadingData(false);
       })
       .catch(err => {
         setError(err.message);
         addToast({ type: "error", title: err.message });
         setLoadingData(false);
       });
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
            <h1 className="text-2xl font-bold">Manage Matches</h1>
            <button
              onClick={() => {
                setEditingMatch(null);
                setFormData({ home_team_id: "", away_team_id: "", match_date: "", venue: "", image_url: "", featured: false, community_visible: false });
                setModalOpen(true);
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Match
            </button>
          </div>

           <div className="bg-red-50 border border-red-200 rounded-lg p-6">
             <div className="flex">
               <div className="flex-shrink-0">
                 <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                 </svg>
               </div>
               <div className="ml-3">
                 <h3 className="text-sm font-medium text-red-800">Error loading matches</h3>
                 <div className="mt-2 text-sm text-red-700">{error}</div>
                 <button
                   onClick={handleRetry}
                   className="mt-3 px-3 py-1.5 text-sm font-medium bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
                 >
                   Retry
                 </button>
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Manage Matches</h1>
          <button
            onClick={() => {
              setEditingMatch(null);
              setFormData({ home_team_id: "", away_team_id: "", match_date: "", venue: "", image_url: "", featured: false, community_visible: false });
              setModalOpen(true);
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Match
          </button>
        </div>

          <div className="flex gap-2">
            {(["all", "scheduled", "live", "finished", "pending"] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-lg text-sm ${filter === status ? "bg-primary text-primary-foreground" : "glass"}`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

        {filteredMatches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No matches created yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMatches.map(match => (
              <div 
                key={match.id} 
                className="glass rounded-xl p-4 border border-white/10"
              >
{match.image_url ? (
                    <img
                      src={match.image_url}
                      alt={`${match.home_team?.name} vs ${match.away_team?.name} cover`}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-black/20 rounded-lg mb-4">
                    <span className="text-muted-foreground">No Image</span>
                  </div>
                )}
                
                <div className="mb-3">
                  <div className="font-medium text-lg">
                    {match.home_team?.name || "TBD"} vs {match.away_team?.name || "TBD"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(match.match_date).toLocaleDateString()} {new Date(match.match_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>

                {match.venue && (
                  <div className="text-xs text-muted-foreground mb-2">
                    Venue: {match.venue}
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${match.status === 'live' ? 'bg-green-500/20 text-green-400' : match.status === 'finished' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                  </span>
                  {match.featured && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase font-bold">Featured</span>}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(match)}
                    className="flex-1 py-2 text-xs border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    Edit
                  </button>
                  <a
                    href={`/admin/scout/live?matchId=${match.id}`}
                    className="flex-1 py-2 text-xs bg-primary/10 text-primary text-center rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    Live Score
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        <AdminModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingMatch(null);
            setFormData({ home_team_id: "", away_team_id: "", match_date: "", venue: "", image_url: "", featured: false, community_visible: false });
          }}
          title={editingMatch ? "Edit Match" : "Add Match"}
          size="lg"
        >
          <div className="space-y-4">
            <AdminFormField label="Home Team">
              <select
                value={formData.home_team_id}
                onChange={e => setFormData({ ...formData, home_team_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20"
              >
                <option value="">Select team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </AdminFormField>
            
            <AdminFormField label="Away Team">
              <select
                value={formData.away_team_id}
                onChange={e => setFormData({ ...formData, away_team_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20"
              >
                <option value="">Select team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </AdminFormField>
            
            <AdminFormField label="Date & Time">
              <input
                type="datetime-local"
                value={formData.match_date}
                onChange={e => setFormData({ ...formData, match_date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20"
              />
            </AdminFormField>
            
            <AdminFormField label="Venue">
              <input
                type="text"
                value={formData.venue}
                onChange={e => setFormData({ ...formData, venue: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20"
                placeholder="Stadium name"
              />
            </AdminFormField>

<AdminFormField label="Cover Image">
               <ImageUpload 
                 label="Cover Image"
                 value={formData.image_url} 
                 onUpload={(url) => setFormData({ ...formData, image_url: url })} 
               />
             </AdminFormField>

            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/5"
                />
                <label htmlFor="featured" className="text-sm font-medium">Featured Match</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="community_visible"
                  checked={formData.community_visible}
                  onChange={e => setFormData({ ...formData, community_visible: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/5"
                />
                <label htmlFor="community_visible" className="text-sm font-medium">Community Visible</label>
              </div>
            </div>
            
            <button onClick={handleSave} className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all">
              {editingMatch ? "Update Match" : "Create Match"}
            </button>
          </div>
        </AdminModal>
      </div>
    </AdminLayout>
  );
}