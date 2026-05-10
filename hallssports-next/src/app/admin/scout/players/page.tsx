"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable, AdminFormField, AdminModal } from "@/components/admin";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState, useEffect, useRef } from "react";
import { Plus, Upload } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import Papa from "papaparse";
import { adminInsert, adminSelect } from "@/app/admin/actions";

type Player = {
  id: string;
  name: string;
  team: string;
  position: string;
  number: number;
  photo?: string;
  is_verified?: boolean;
};

type CsvRow = { name?: string; team?: string; position?: string; number?: string };

export default function PlayersPage() {
  const { loading } = useAdminAuth("scout");
  const { addToast } = useToast();
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [csvPreview, setCsvPreview] = useState<CsvRow[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    team: "",
    position: "",
    number: "",
    photo: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [playersData, teamsData] = await Promise.all([
          adminSelect('players', {}, { order: { field: 'name' } }) as Promise<Player[]>,
          adminSelect('teams') as Promise<Array<{ name: string }>>,
        ]);
        setPlayers(playersData);
        setTeams((teamsData || []).map(t => t.name));
       } catch {
         addToast({ type: "error", title: "Failed to load data" });
       } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [addToast]);

  const columns = [
    { header: "Photo", accessor: () => "—" },
    { header: "Name", accessor: "name" },
    { header: "Team", accessor: "team" },
    { header: "Position", accessor: "position" },
    { header: "Number", accessor: "number" },
  ];

  const handleSave = async () => {
    try {
      await adminInsert('players', {
        name: formData.name,
        team: formData.team,
        position: formData.position,
        number: parseInt(formData.number),
        is_verified: false,
      });
      addToast({ type: "success", title: "Player added" });
       setModalOpen(false);
       // Refresh
       const data = await adminSelect('players', {}, { order: { field: 'name' } });
       setPlayers(data as Player[]);
     } catch (err) {
       const message = err instanceof Error ? err.message : "Failed to add player";
       addToast({ type: "error", title: message });
     }
  };

  const handleImport = async () => {
    if (!csvPreview.length) return;
    try {
      await Promise.all(
        csvPreview.map(p =>
          adminInsert('players', {
            name: p.name || "",
            team: p.team || "",
            position: p.position || "",
            number: parseInt(p.number || "0"),
            is_verified: false,
          })
        )
      );
      addToast({ type: "success", title: "Players imported" });
       setImportModal(false);
       setCsvPreview([]);
       const data = await adminSelect('players', {}, { order: { field: 'name' } });
       setPlayers(data as Player[]);
     } catch {
       addToast({ type: "error", title: "Import failed" });
     }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setCsvPreview((results.data as CsvRow[]).slice(0, 5));
        setImportModal(true);
      },
    });
  };

  if (loading || loadingData) {
    return (
      <AdminLayout role="scout">
        <Skeleton className="h-96 w-full" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout role="scout">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Manage Players</h1>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 glass rounded-lg flex items-center gap-2 text-sm"
            >
              Export CSV
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 glass rounded-lg flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import CSV
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Player
            </button>
          </div>
        </div>

        <AdminTable columns={columns} data={players} />

        <AdminModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Add Player"
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
                value={formData.team}
                onChange={e => setFormData({ ...formData, team: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20"
              >
                <option value="">Select team</option>
                {teams.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </AdminFormField>
            
            <AdminFormField label="Position">
              <input
                value={formData.position}
                onChange={e => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20"
              />
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
              Save Player
            </button>
          </div>
        </AdminModal>

        <AdminModal
          isOpen={importModal}
          onClose={() => setImportModal(false)}
          title="Confirm Import"
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Preview of first {csvPreview.length} rows. Confirm import?
            </p>
            <pre className="p-3 rounded bg-black/20 text-xs overflow-auto">
              {JSON.stringify(csvPreview, null, 2)}
            </pre>
            <div className="flex gap-3">
              <button
                onClick={handleImport}
                className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg"
              >
                Import All
              </button>
              <button
                onClick={() => setImportModal(false)}
                className="flex-1 py-2 glass rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </AdminModal>
      </div>
    </AdminLayout>
  );
}