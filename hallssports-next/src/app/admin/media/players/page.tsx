"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";
import { adminSelect } from "@/app/admin/actions";
import { FullScreenOverlay } from "@/components/FullScreenOverlay";
import ImageUpload from "@/components/admin/ImageUpload";
import { User } from "lucide-react";

type Player = {
  id: string;
  name: string;
  team_id: string;
  number: string;
  position: string;
  photo_url?: string;
  bio?: string;
  teams?: { name: string };
};

export default function PlayerPhotosPage() {
  const { loading } = useAdminAuth("media");
  const { addToast } = useToast();
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [newBio, setNewBio] = useState("");
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newPosition, setNewPosition] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [playersData, teamsData] = await Promise.all([
          adminSelect('players', {}, { 
            select: '*, teams:team_id(name)',
            order: { field: 'name', ascending: true } 
          }) as Promise<Player[]>,
          adminSelect('teams') as Promise<Array<{ id: string; name: string }>>,
        ]);
        setPlayers(playersData);
        setTeams(teamsData);
      } catch (error) {
        console.error('Failed to load players:', error);
        addToast({ type: "error", title: "Failed to load players" });
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [addToast]);

  const missingPhotosCount = players.filter(p => !p.photo_url).length;

  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = selectedTeam === "all" || p.team_id === selectedTeam;
    return matchesSearch && matchesTeam;
  });

  const handleSave = async () => {
    if (!editingPlayerId) return;
    
    if (!uploadedUrl) {
      addToast({ type: "error", title: "Player photo is required" });
      return;
    }

    try {
      const res = await fetch('/api/admin/update-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPlayerId,
          photo_url: uploadedUrl,
          bio: newBio,
          name: newName,
          number: parseInt(newNumber),
          position: newPosition
        })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update player');
      }
      
      // Update local state
      setPlayers(prev => 
        prev.map(p => 
          p.id === editingPlayerId 
            ? { ...p, photo_url: uploadedUrl ?? undefined, bio: newBio, name: newName, number: newNumber, position: newPosition } 
            : p
        )
      );
      
      setEditingPlayerId(null);
      setUploadedUrl(null);
      setNewBio("");
      setNewName("");
      setNewNumber("");
      setNewPosition("");
      addToast({ type: "success", title: "Player updated" });
    } catch (error) {
      console.error('Failed to update player:', error);
      addToast({ type: "error", title: error instanceof Error ? error.message : "Failed to update player" });
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Player Photos</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-lg">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search players..."
                className="bg-transparent text-sm focus:outline-none w-32 sm:w-auto"
              />
            </div>
            <select
              value={selectedTeam}
              onChange={e => setSelectedTeam(e.target.value)}
              className="glass px-3 py-1.5 rounded-lg text-sm min-h-[44px]"
            >
              <option value="all">All Teams</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <button
              onClick={() => {
                const firstMissing = players.find(p => !p.photo_url);
                if (firstMissing) {
                  const el = document.getElementById(`player-${firstMissing.id}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 rounded-lg text-sm font-medium min-h-[44px]"
            >
              Missing: {missingPhotosCount}
            </button>
          </div>
        </div>

        {filteredPlayers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No players yet. Add players from the Scout section.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlayers.map(player => (
            <div 
              key={player.id} 
              id={`player-${player.id}`}
              className="glass rounded-xl p-4 border border-white/10 space-y-4"
            >
              <div className="flex items-center gap-3">
<div className="relative w-12 h-12 rounded-full overflow-hidden bg-black/20 flex-shrink-0">
                    {player.photo_url ? (
                      <img
                        src={player.photo_url}
                        alt={player.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-muted-foreground m-auto" />
                    )}
                  </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{player.name}</div>
                  <div className="text-xs text-muted-foreground">
                    #{player.number} • {player.position}
                  </div>
                  {player.teams && (
                    <div className="text-xs text-primary">{player.teams.name}</div>
                  )}
                </div>
              </div>

              <div className="text-xs">
                <span className="text-muted-foreground">Bio: </span>
                <span className="line-clamp-2">
                  {player.bio ? player.bio.slice(0, 80) + (player.bio.length > 80 ? '...' : '') : 'No bio yet'}
                </span>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    setEditingPlayerId(player.id);
                    setUploadedUrl(player.photo_url ?? null);
                    setNewBio(player.bio || "");
                    setNewName(player.name);
                    setNewNumber(player.number.toString());
                    setNewPosition(player.position);
                  }}
                  className="flex-1 min-h-[44px] px-3 py-2 border border-green-500/40 rounded-lg text-green-400 hover:bg-green-500/10"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}

          <FullScreenOverlay
            isOpen={!!editingPlayerId}
            onClose={() => {
              setEditingPlayerId(null);
              setUploadedUrl(null);
              setNewBio("");
              setNewName("");
              setNewNumber("");
              setNewPosition("");
            }}
          >
            {editingPlayerId ? (
              <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                <h2 className="text-xl font-bold">Edit Player</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Full Name</label>
                      <input
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Jersey Number</label>
                      <input
                        type="number"
                        value={newNumber}
                        onChange={e => setNewNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Position</label>
                      <select
                        value={["Goalkeeper", "Defender", "Midfielder", "Forward", "Coach"].includes(newPosition) ? newPosition : (newPosition ? "Other" : "")}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === "Other") {
                            setNewPosition("");
                          } else {
                            setNewPosition(val);
                          }
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 mb-2 outline-none focus:border-primary"
                      >
                        <option value="">Select position</option>
                        <option value="Goalkeeper">Goalkeeper</option>
                        <option value="Defender">Defender</option>
                        <option value="Midfielder">Midfielder</option>
                        <option value="Forward">Forward</option>
                        <option value="Coach">Coach</option>
                        <option value="Other">Other</option>
                      </select>
                      {(newPosition === "" || !["Goalkeeper", "Defender", "Midfielder", "Forward", "Coach"].includes(newPosition)) && (
                        <input
                          value={newPosition}
                          onChange={e => setNewPosition(e.target.value)}
                          placeholder="Enter custom position"
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-primary outline-none"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <ImageUpload 
                      label="Player Photo"
                      currentUrl={uploadedUrl}
                      onUpload={(url) => setUploadedUrl(url)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    value={newBio}
                    onChange={e => setNewBio(e.target.value)}
                    placeholder="Enter player bio..."
                    className="w-full h-32 px-3 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-primary focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setEditingPlayerId(null);
                      setUploadedUrl(null);
                      setNewBio("");
                      setNewName("");
                      setNewNumber("");
                      setNewPosition("");
                    }}
                    className="flex-1 min-h-[44px] px-4 py-2 rounded-lg glass hover:bg-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!uploadedUrl && !players.find(p => p.id === editingPlayerId)?.photo_url}
                    className="flex-1 min-h-[44px] px-4 py-2 bg-green-500 text-green-50 foreground rounded-lg disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : null}
          </FullScreenOverlay>
        </div>
      </div>
    </AdminLayout>
  );
}