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
import { Upload, ImageIcon } from "lucide-react";

type Match = {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  image_url?: string;
};

export default function MatchCoversPage() {
  const { loading } = useAdminAuth("media");
  const { addToast } = useToast();
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [uploadUrl, setUploadUrl] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminSelect('matches', {}, { order: { field: 'match_date', ascending: false } }) as Match[];
        setMatches(data);
      } catch {
        addToast({ type: "error", title: "Failed to load matches" });
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [addToast]);

  const handleUpload = async () => {
    if (!selectedMatch || !uploadUrl) return;
    setUploadingId(selectedMatch.id);
    try {
      await adminUpdate('matches', { id: selectedMatch.id }, { image_url: uploadUrl });
      setMatches(matches.map(m => m.id === selectedMatch.id ? { ...m, image_url: uploadUrl } : m));
      setShowUploadModal(false);
      setUploadUrl("");
      setSelectedMatch(null);
      addToast({ type: "success", title: "Cover image updated" });
    } catch {
      addToast({ type: "error", title: "Failed to update cover image" });
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
                  {match.home_team} vs {match.away_team}
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

              <button
                onClick={() => {
                  setSelectedMatch(match);
                  setUploadUrl(match.image_url || "");
                  setShowUploadModal(true);
                }}
                className="w-full min-h-[44px] px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
              >
                <Upload className="w-4 h-4" />
                {match.image_url ? "Replace Cover" : "Upload Cover"}
              </button>
            </div>
          ))}
        </div>

        <FullScreenOverlay
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
        >
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{selectedMatch?.home_team} vs {selectedMatch?.away_team}</h2>
            <div>
              <label className="block text-sm font-medium mb-1.5">Image URL</label>
              <input
                type="url"
                value={uploadUrl}
                onChange={e => setUploadUrl(e.target.value)}
                placeholder="https://cloudinary.com/..."
                className="w-full h-12 px-3 rounded-lg bg-white/5 border border-white/20 focus:border-primary focus:outline-none"
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
                disabled={!uploadUrl || uploadingId === selectedMatch?.id}
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