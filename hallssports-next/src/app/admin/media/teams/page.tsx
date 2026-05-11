"use client";
/* eslint-disable @next/next/no-img-element */

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";
import { adminSelect, adminUpdate } from "@/app/admin/actions";
import { FullScreenOverlay } from "@/components/FullScreenOverlay";
import { Upload, Shield } from "lucide-react";
import { CloudinaryUpload } from "@/components/admin/CloudinaryUpload";

type Team = {
  id: string;
  name: string;
  logo_url?: string;
};

export default function TeamLogosPage() {
  const { loading } = useAdminAuth("media");
  const { addToast } = useToast();
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [uploadUrl, setUploadUrl] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminSelect('teams', {}, { order: { field: 'name', ascending: true } }) as Team[];
        setTeams(data);
      } catch {
        addToast({ type: "error", title: "Failed to load teams" });
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [addToast]);

  const handleUpload = async () => {
    if (!selectedTeam || !uploadUrl) return;
    setUploadingId(selectedTeam.id);
    try {
      await adminUpdate('teams', { id: selectedTeam.id }, { logo_url: uploadUrl });
      setTeams(teams.map(t => t.id === selectedTeam.id ? { ...t, logo_url: uploadUrl } : t));
      setShowUploadModal(false);
      setUploadUrl("");
      addToast({ type: "success", title: "Logo updated" });
    } catch {
      addToast({ type: "error", title: "Failed to update logo" });
    } finally {
      setUploadingId(null);
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
          <h1 className="text-2xl font-bold">Team Logos</h1>
          <div className="text-sm text-muted-foreground">
            {teams.filter(t => !t.logo_url).length} missing logos
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {teams.map(team => (
            <div key={team.id} className="glass rounded-xl p-4 border border-white/10 text-center">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-black/20 mx-auto mb-3 flex items-center justify-center">
                {team.logo_url ? (
                  <img
                    src={team.logo_url}
                    alt={team.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <Shield className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <div className="font-medium text-sm mb-3 truncate">{team.name}</div>
              <button
                onClick={() => {
                  setSelectedTeam(team);
                  setUploadUrl(team.logo_url || "");
                  setShowUploadModal(true);
                }}
                className="w-full min-h-[44px] px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg text-sm font-medium"
              >
                {team.logo_url ? "Replace" : "Upload"}
              </button>
            </div>
          ))}
        </div>

        <FullScreenOverlay
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
        >
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{selectedTeam?.name} Logo</h2>
            <div>
              <label className="block text-sm font-medium mb-1.5">Logo Image</label>
              <CloudinaryUpload 
                value={uploadUrl} 
                onSuccess={(url) => setUploadUrl(url)} 
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 min-h-[44px] px-4 py-2 rounded-lg glass hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!uploadUrl || uploadingId === selectedTeam?.id}
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
