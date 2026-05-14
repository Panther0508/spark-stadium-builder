"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";
import { adminSelect } from "@/app/admin/actions";
import { FullScreenOverlay } from "@/components/FullScreenOverlay";
import ImageUpload from "@/components/admin/ImageUpload";
import { ImageIcon } from "lucide-react";

type Match = {
  id: string;
  home_team_id?: string;
  away_team_id?: string;
  home_team?: { name: string } | string | null;
  away_team?: { name: string } | string | null;
  match_date: string;
  image_url?: string;
  admin_post?: string;
  venue?: string;
};

export default function MatchCoversPage() {
  const { loading } = useAdminAuth("media");
  const { addToast } = useToast();
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [newAdminPost, setNewAdminPost] = useState("");
  const [newVenue, setNewVenue] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminSelect('matches', {}, {
          select: '*, home_team:home_team_id(name), away_team:away_team_id(name), admin_post, venue',
          order: { field: 'match_date', ascending: false }
        }) as Match[];
        setMatches(data);
      } catch (error) {
        console.error('Failed to load matches:', error);
        addToast({ type: "error", title: "Failed to load matches" });
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [addToast]);

  const getTeamName = (team: Match["home_team"] | Match["away_team"]) => {
    if (!team) return "Unknown";
    return typeof team === "object" && "name" in team ? team.name : String(team);
  };

  const handleSave = async () => {
    if (!editingMatchId) return;
    
    if (!uploadedImageUrl) {
      addToast({ type: "error", title: "Please upload a match cover image first" });
      return;
    }
    
    try {
      const res = await fetch('/api/admin/match-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: editingMatchId,
          image_url: uploadedImageUrl,
          admin_post: newAdminPost,
          venue: newVenue 
        })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update match');
      }
      
      // Update local state
      setMatches(prev => 
        prev.map(m => 
          m.id === editingMatchId 
            ? { ...m, image_url: uploadedImageUrl ?? undefined, admin_post: newAdminPost, venue: newVenue } 
            : m
        )
      );
      
      setEditingMatchId(null);
      setUploadedImageUrl(null);
      setNewAdminPost("");
      setNewVenue("");
      addToast({ type: "success", title: "Match updated" });
    } catch (error) {
      console.error('Failed to update match:', error);
      addToast({ type: "error", title: error instanceof Error ? error.message : "Failed to update match" });
    }
  };

  if (loading || loadingData) {
    return (
      <AdminLayout role="media">
        <Skeleton className="h-96 w-full" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout role="media">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Match Covers</h1>
          <div className="text-sm text-muted-foreground">
            {matches.filter(m => !m.image_url).length} missing covers
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map(match => (
            <div key={match.id} className="glass rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium text-sm">
                  {getTeamName(match.home_team)} vs {getTeamName(match.away_team)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(match.match_date).toLocaleDateString()}
                </div>
              </div>
              
<div className="aspect-video bg-black/20 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                  {match.image_url ? (
                    <img
                      src={match.image_url}
                      alt="Match cover"
                      className="max-w-full max-h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>

              <div className="text-xs text-muted-foreground">
                Venue: {match.venue || "No venue set"}
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    setEditingMatchId(match.id);
                    setUploadedImageUrl(match.image_url ?? null);
                    setNewAdminPost(match.admin_post ?? "");
                    setNewVenue(match.venue ?? "");
                  }}
                  className="flex-1 min-h-[44px] px-3 py-2 border border-green-500/40 rounded-lg text-green-400 hover:bg-green-500/10"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}

          <FullScreenOverlay
            isOpen={!!editingMatchId}
            onClose={() => {
              setEditingMatchId(null);
              setUploadedImageUrl(null);
              setNewAdminPost("");
              setNewVenue("");
            }}
          >
            {editingMatchId ? (
              <>
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Edit Match</h2>
                  <ImageUpload 
                    label="Match Cover"
                    currentUrl={uploadedImageUrl ?? undefined}
                    onUpload={(url) => setUploadedImageUrl(url)}
                  />
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Match Bio / Admin Post</label>
                      <textarea
                        value={newAdminPost}
                        onChange={e => setNewAdminPost(e.target.value)}
                        placeholder="Enter match bio or admin post..."
                        className="w-full h-32 px-3 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-primary focus:outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Venue</label>
                      <input
                        value={newVenue}
                        onChange={e => setNewVenue(e.target.value)}
                        placeholder="Enter venue"
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setEditingMatchId(null);
                        setUploadedImageUrl(null);
                        setNewAdminPost("");
                        setNewVenue("");
                      }}
                      className="flex-1 min-h-[44px] px-4 py-2 rounded-lg glass hover:bg-white/20"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!uploadedImageUrl && !matches.find(m => m.id === editingMatchId)?.image_url}
                      className="flex-1 min-h-[44px] px-4 py-2 bg-green-500 text-green-50 foreground rounded-lg disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </FullScreenOverlay>
        </div>
      </div>
    </AdminLayout>
  );
}