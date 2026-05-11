"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable, AdminModal, AdminFormField } from "@/components/admin";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { adminSelect, adminInsert, adminUpdate } from "@/app/admin/actions";
import { CloudinaryUpload } from "@/components/admin/CloudinaryUpload";

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
};

type Team = { id: string; name: string };

export default function MatchesPage() {
  const { loading } = useAdminAuth("scout");
  const { addToast } = useToast();
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingData, setLoadingData] = useState(true);
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

  useEffect(() => {
    const load = async () => {
      try {
        const [matchesData, teamsData] = await Promise.all([
          adminSelect('matches', {}, { 
            select: '*, home_team:home_team_id(name), away_team:away_team_id(name)',
            order: { field: 'match_date', ascending: false } 
          }) as Promise<Match[]>,
          adminSelect('teams') as Promise<Team[]>,
        ]);
        setMatches(matchesData);
        setTeams(teamsData || []);
       } catch {
         addToast({ type: "error", title: "Failed to load data" });
       } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [addToast]);

  const filteredMatches = matches.filter(m => {
    if (filter === "all") return true;
    if (filter === "pending") return !m.is_verified;
    return m.status === filter;
  });

  const columns = [
    { header: "Date", accessor: "match_date", className: "w-32" },
    { header: "Teams", accessor: (row: Match) => `${row.home_team?.name || 'Unknown'} vs ${row.away_team?.name || 'Unknown'}` },
    { header: "Score", accessor: (row: Match) => `${row.home_score ?? "—"} : ${row.away_score ?? "—"}` },
    { header: "Status", accessor: "status" },
    { header: "Verified", accessor: (row: Match) => row.is_verified ? "✓" : "—", className: "w-20" },
  ];

  const handleSave = async () => {
    try {
      const data = {
        home_team_id: formData.home_team_id,
        away_team_id: formData.away_team_id,
        match_date: new Date(formData.match_date).toISOString(),
        venue: formData.venue,
        image_url: formData.image_url,
        community_visible: formData.community_visible,
      };

      if (editingMatch) {
        await adminUpdate('matches', { id: editingMatch.id }, data);
        addToast({ type: "success", title: "Match updated" });
      } else {
        await adminInsert('matches', data);
        addToast({ type: "success", title: "Match created" });
      }
      
       setModalOpen(false);
       setEditingMatch(null);
       const updated = await adminSelect('matches', {}, { 
         select: '*, home_team:home_team_id(name), away_team:away_team_id(name)',
         order: { field: 'match_date', ascending: false } 
       });
       setMatches(updated as Match[]);
     } catch (err) {
       const message = err instanceof Error ? err.message : "Failed to save match";
       addToast({ type: "error", title: message });
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

        <AdminTable columns={columns} data={filteredMatches} />

        <AdminModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
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
              <CloudinaryUpload 
                value={formData.image_url} 
                onSuccess={(url) => setFormData({ ...formData, image_url: url })} 
              />
            </AdminFormField>

            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="community_visible"
                checked={formData.community_visible}
                onChange={e => setFormData({ ...formData, community_visible: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/5"
              />
              <label htmlFor="community_visible" className="text-sm font-medium">Visible to Community (Chat Selection)</label>
            </div>
            
            <button onClick={handleSave} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
              Save
            </button>
          </div>
        </AdminModal>
      </div>
    </AdminLayout>
  );
}
