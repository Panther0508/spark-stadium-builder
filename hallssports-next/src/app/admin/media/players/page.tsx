"use client";
/* eslint-disable @next/next/no-img-element */

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminCard } from "@/components/admin/AdminCard";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";
import { adminSelect, adminUpdate } from "@/app/admin/actions";
import { FullScreenOverlay } from "@/components/FullScreenOverlay";
import { Upload, User, Search, Filter, Image as ImageIcon } from "lucide-react";

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
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [editingBioId, setEditingBioId] = useState<string | null>(null);
  const [bioText, setBioText] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [playersData, teamsData] = await Promise.all([
          adminSelect('players', {}, { order: { field: 'name', ascending: true } }) as Promise<Player[]>,
          adminSelect('teams') as Promise<Array<{ id: string; name: string }>>,
        ]);
        setPlayers(playersData);
        setTeams(teamsData);
      } catch {
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

  const handlePhotoUpload = async (playerId: string) => {
    if (!uploadUrl) return;
    setUploadingId(playerId);
    try {
      await adminUpdate('players', { id: playerId }, { photo_url: uploadUrl });
      setPlayers(players.map(p => p.id === playerId ? { ...p, photo_url: uploadUrl } : p));
      setUploadUrl("");
      addToast({ type: "success", title: "Photo updated" });
    } catch {
      addToast({ type: "error", title: "Failed to update photo" });
    } finally {
      setUploadingId(null);
    }
  };

  const handleBioSave = async (playerId: string) => {
    setUploadingId(playerId);
    try {
      await adminUpdate('players', { id: playerId }, { bio: bioText });
      setPlayers(players.map(p => p.id === playerId ? { ...p, bio: bioText } : p));
      setEditingBioId(null);
      addToast({ type: "success", title: "Bio updated" });
    } catch {
      addToast({ type: "error", title: "Failed to update bio" });
    } finally {
      setUploadingId(null);
    }
  };

  const scrollToFirstMissing = () => {
    const firstMissing = players.find(p => !p.photo_url);
    if (firstMissing) {
      const el = document.getElementById(`player-${firstMissing.id}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
              <Search className="w-4 h-4 text-muted-foreground" />
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
              onClick={scrollToFirstMissing}
              className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 rounded-lg text-sm font-medium min-h-[44px]"
            >
              Missing: {missingPhotosCount}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map(player => (
            <div 
              key={player.id} 
              id={`player-${player.id}`}
              className="glass rounded-xl p-4 border border-white/10 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-black/20 flex-shrink-0">
                  {player.photo_url ? (
                    <img
                      src={player.photo_url}
                      alt={player.name}
                      className="max-w-full max-h-full object-cover"
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
                  {player.bio ? player.bio.slice(0, 80) + (player.bio.length > 80 ? '...' : '') : 'No bio'}
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={uploadUrl}
                  onChange={e => setUploadUrl(e.target.value)}
                  placeholder="Photo URL..."
                  className="flex-1 h-10 px-2 text-xs rounded-lg bg-white/5 border border-white/20"
                />
                <button
                  onClick={() => handlePhotoUpload(player.id)}
                  disabled={!uploadUrl || uploadingId === player.id}
                  className="min-h-[44px] min-w-[44px] px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg flex items-center justify-center"
                  title="Upload Photo"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  setEditingBioId(player.id);
                  setBioText(player.bio || "");
                }}
                className="w-full min-h-[44px] px-3 py-2 glass hover:bg-white/20 rounded-lg text-sm"
              >
                Edit Bio
              </button>
            </div>
          ))}
        </div>

        <FullScreenOverlay
          isOpen={!!editingBioId}
          onClose={() => setEditingBioId(null)}
        >
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Edit Bio</h2>
            <textarea
              value={bioText}
              onChange={e => setBioText(e.target.value)}
              placeholder="Enter player bio..."
              className="w-full h-32 px-3 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-primary focus:outline-none resize-none"
            />
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditingBioId(null)}
                className="flex-1 min-h-[44px] px-4 py-2 rounded-lg glass hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBioSave(editingBioId!)}
                disabled={uploadingId === editingBioId}
                className="flex-1 min-h-[44px] px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
              >
                {uploadingId ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </FullScreenOverlay>
      </div>
    </AdminLayout>
  );
}