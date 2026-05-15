"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";
import { adminSelect } from "@/app/admin/actions";
import { FullScreenOverlay } from "@/components/FullScreenOverlay";
import ImageUpload from "@/components/admin/ImageUpload";
import { Shield } from "lucide-react";

type Team = {
  id: string;
  name: string;
  short_name: string;
  logo_url?: string;
};

export default function TeamLogosPage() {
  const { loading } = useAdminAuth("media");
  const { addToast } = useToast();
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newShortName, setNewShortName] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        // We limit to 5 teams as per tournament requirements
        const data = await adminSelect('teams', {}, { order: { field: 'name', ascending: true } }) as Team[];
        setTeams(data.slice(0, 5));
      } catch (error) {
        console.error('Failed to load teams:', error);
        addToast({ type: "error", title: "Failed to load teams" });
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [addToast]);

  const handleSave = async () => {
    if (!editingTeamId) return;
    
    if (!uploadedLogoUrl) {
      addToast({ type: "error", title: "Please upload a team logo first" });
      return;
    }
    
    try {
      const res = await fetch('/api/admin/update-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingTeamId,
          logo_url: uploadedLogoUrl,
          name: newName,
          short_name: newShortName 
        })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update team');
      }
      
      // Update local state
      setTeams(prev => 
        prev.map(t => 
          t.id === editingTeamId 
            ? { ...t, logo_url: uploadedLogoUrl ?? undefined, name: newName, short_name: newShortName } 
            : t
        )
      );
      
      setEditingTeamId(null);
      setUploadedLogoUrl(null);
      setNewName("");
      setNewShortName("");
      addToast({ type: "success", title: "Team updated" });
    } catch (error) {
      console.error('Failed to update team:', error);
      addToast({ type: "error", title: error instanceof Error ? error.message : "Failed to update team" });
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Teams Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Tournament is limited to exactly 5 seeded teams.
            </p>
          </div>
          <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary font-medium w-fit">
            {teams.filter(t => t.logo_url).length} / 5 Logos Uploaded
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(team => (
            <div key={team.id} className="glass rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
<div className="w-16 h-16 rounded-full overflow-hidden bg-black/20 flex-shrink-0">
                    {team.logo_url ? (
                      <img
                        src={team.logo_url}
                        alt={team.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Shield className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                <div>
                  <div className="font-medium">{team.name}</div>
                  <div className="text-xs text-muted-foreground">{team.short_name}</div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setEditingTeamId(team.id);
                  setUploadedLogoUrl(team.logo_url ?? null);
                  setNewName(team.name);
                  setNewShortName(team.short_name);
                }}
                className="w-full min-h-[44px] px-3 py-2 border border-green-500/40 rounded-lg text-green-400 hover:bg-green-500/10"
              >
                Edit
              </button>
            </div>
          ))}
        </div>

        <FullScreenOverlay
          isOpen={!!editingTeamId}
          onClose={() => {
            setEditingTeamId(null);
            setUploadedLogoUrl(null);
            setNewName("");
            setNewShortName("");
          }}
        >
          {editingTeamId ? (
            <>
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Edit Team</h2>
                <ImageUpload 
                  label="Team Logo"
                  currentUrl={uploadedLogoUrl}
                  onUpload={(url) => setUploadedLogoUrl(url)}
                />
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Team Name</label>
                    <input
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder="Enter full team name"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Short Name</label>
                    <input
                      value={newShortName}
                      onChange={e => setNewShortName(e.target.value)}
                      placeholder="Enter short name"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setEditingTeamId(null);
                      setUploadedLogoUrl(null);
                      setNewName("");
                      setNewShortName("");
                    }}
                    className="flex-1 min-h-[44px] px-4 py-2 rounded-lg glass hover:bg-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!uploadedLogoUrl && !teams.find(t => t.id === editingTeamId)?.logo_url}
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
    </AdminLayout>
  );
}