"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminFormField, AdminModal } from "@/components/admin";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState, useEffect, useRef } from "react";
import { Plus, User, FileUp, Download } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { adminSelect, adminInsert, adminUpdate } from "@/app/admin/actions";
import Papa from "papaparse";

type Player = {
  id: string;
  name: string;
  team_id: string;
  position: string;
  number: number;
  photo_url?: string;
  is_verified?: boolean;
  teams?: { name: string };
};

type Team = { id: string; name: string };

export default function PlayersPage() {
  const { loading } = useAdminAuth("scout");
  const { addToast } = useToast();
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    team_id: "",
    position: "",
    number: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        interface CSVRow {
          name: string;
          team: string;
          position: string;
          number: string;
        }
        const rows = results.data as CSVRow[];
        if (rows.length === 0) {
          addToast({ type: "error", title: "CSV is empty" });
          return;
        }

        // Validate headers
        const headers = Object.keys(rows[0]);
        const required = ["name", "team", "position", "number"];
        const missing = required.filter(h => !headers.includes(h));
        
        if (missing.length > 0) {
          addToast({ type: "error", title: `Missing headers: ${missing.join(", ")}` });
          return;
        }

        try {
          const playersToInsert = rows.map(row => {
            const team = teams.find(t => t.name.toLowerCase() === row.team.trim().toLowerCase());
            if (!team) throw new Error(`Team not found: ${row.team}`);
            return {
              name: row.name.trim(),
              team_id: team.id,
              position: row.position.trim(),
              number: row.number.trim(),
            };
          });

          const res = await fetch("/api/admin/players-bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(playersToInsert),
          });

          if (!res.ok) throw new Error("Bulk import failed");
          
          addToast({ type: "success", title: `Imported ${playersToInsert.length} players` });
          handleRetry(); // Refresh list
        } catch (err) {
          addToast({ type: "error", title: err instanceof Error ? err.message : "Import failed" });
        } finally {
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      }
    });
  };

  const downloadTemplate = () => {
    const csv = Papa.unparse([
      { name: "John Doe", team: teams[0]?.name || "Rangers FC", position: "Forward", number: "10" },
      { name: "Jane Smith", team: teams[1]?.name || "Panthers United", position: "Midfielder", number: "7" },
    ]);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "player_template.csv";
    a.click();
  };

useEffect(() => {
    const handleLoad = async () => {
      setError(null);
      setLoadingData(true);
      try {
        const [playersData, teamsData] = await Promise.all([
          adminSelect('players', {}, { 
            select: '*, teams:team_id(name)',
            order: { field: 'name' } 
          }) as Promise<Player[]>,
          adminSelect('teams') as Promise<Team[]>,
        ]);
        setPlayers(playersData);
        setTeams(teamsData || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load data";
        setError(message);
        addToast({ type: "error", title: message });
      } finally {
        setLoadingData(false);
      }
    };
    handleLoad();
  }, [addToast]);

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = player.teams?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    return matchesSearch || matchesTeam;
  });

const handleSave = async () => {
  try {
    const data = {
      id: editingPlayer?.id,
      name: formData.name,
      team_id: formData.team_id,
      position: formData.position,
      number: parseInt(formData.number),
    };

    const res = await fetch("/api/admin/update-player", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to save player");
    }

    addToast({ type: "success", title: editingPlayer ? "Player updated" : "Player added" });
    setModalOpen(false);
    setEditingPlayer(null);
    setFormData({ name: "", team_id: "", position: "", number: "" });
    handleRetry(); // Refresh list
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save player";
    setError(message);
    addToast({ type: "error", title: message });
  }
};
  const handleRetry = async () => {
    setError(null);
    setLoadingData(true);
    try {
      const [playersData, teamsData] = await Promise.all([
        adminSelect('players', {}, { 
          select: '*, teams:team_id(name)',
          order: { field: 'name' } 
        }) as Promise<Player[]>,
        adminSelect('teams') as Promise<Team[]>,
      ]);
      setPlayers(playersData);
      setTeams(teamsData || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load data";
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
            <h1 className="text-2xl font-bold">Manage Players</h1>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingPlayer(null);
                  setFormData({ name: "", team_id: "", position: "", number: "" });
                  setModalOpen(true);
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Player
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name or team..."
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/20 w-48"
            />
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading players</h3>
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

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name or team..."
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/20 w-48"
            />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout role="scout">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Manage Players</h1>
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCSVImport}
              accept=".csv"
              className="hidden"
            />
            <button
              onClick={downloadTemplate}
              className="px-4 py-2 glass border border-white/10 rounded-lg flex items-center gap-2 hover:bg-white/5 transition-all text-xs sm:text-sm"
              title="Download CSV Template"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Template</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 glass border border-white/10 rounded-lg flex items-center gap-2 hover:bg-white/5 transition-all text-xs sm:text-sm"
            >
              <FileUp className="w-4 h-4" />
              <span className="hidden sm:inline">Import CSV</span>
            </button>
            <button
              onClick={() => {
                setEditingPlayer(null);
                setFormData({ name: "", team_id: "", position: "", number: "" });
                setModalOpen(true);
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Player
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name or team..."
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/20 w-48"
          />
        </div>

        {filteredPlayers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No players found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlayers.map(player => (
              <div 
                key={player.id} 
                className="glass rounded-xl p-4 border border-white/10"
              >
                <div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-full overflow-hidden bg-black/20 flex-shrink-0">
                    {player.photo_url ? (
                      <img
                        src={player.photo_url}
                        alt={player.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{player.name}</div>
                    <div className="text-xs text-muted-foreground">
                      #{player.number} • {player.position}
                    </div>
                    {player.teams && (
                      <div className="text-xs text-primary">{player.teams.name}</div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setEditingPlayer(player);
                      setFormData({
                        name: player.name,
                        team_id: player.team_id,
                        position: player.position,
                        number: player.number.toString(),
                      });
                    }}
                    className="px-3 py-1.5 border border-green-500/40 rounded-lg text-green-400 hover:bg-green-500/10"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <AdminModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingPlayer(null);
            setFormData({ name: "", team_id: "", position: "", number: "" });
          }}
          title={editingPlayer ? "Edit Player" : "Add Player"}
        >
          <div className="space-y-4">
            <AdminFormField label="Name">
              <input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20"
              />
            </AdminFormField>
            
            <AdminFormField label="Team">
              <select
                value={formData.team_id}
                onChange={e => setFormData({ ...formData, team_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20"
              >
                <option value="">Select team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </AdminFormField>
            
            <AdminFormField label="Position">
              <select
                value={["Goalkeeper", "Defender", "Midfielder", "Forward", "Coach"].includes(formData.position) ? formData.position : (formData.position ? "Other" : "")}
                onChange={e => {
                  const val = e.target.value;
                  if (val === "Other") {
                    setFormData({ ...formData, position: "" });
                  } else {
                    setFormData({ ...formData, position: val });
                  }
                }}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 mb-2"
              >
                <option value="">Select position</option>
                <option value="Goalkeeper">Goalkeeper</option>
                <option value="Defender">Defender</option>
                <option value="Midfielder">Midfielder</option>
                <option value="Forward">Forward</option>
                <option value="Coach">Coach</option>
                <option value="Other">Other</option>
              </select>
              {(formData.position === "" || !["Goalkeeper", "Defender", "Midfielder", "Forward", "Coach"].includes(formData.position)) && (
                <input
                  value={formData.position}
                  onChange={e => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Enter custom position"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20"
                />
              )}
            </AdminFormField>
            
            <AdminFormField label="Jersey Number">
              <input
                type="number"
                value={formData.number}
                onChange={e => setFormData({ ...formData, number: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20"
              />
            </AdminFormField>
            
            <button
              onClick={handleSave}
              className="w-full py-2 bg-primary text-primary-foreground rounded-lg"
            >
              {editingPlayer ? "Update Player" : "Save Player"}
            </button>
          </div>
        </AdminModal>
      </div>
    </AdminLayout>
  );
}