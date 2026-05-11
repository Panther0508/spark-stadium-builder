"use client";
/* eslint-disable @next/next/no-img-element */

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminCard } from "@/components/admin/AdminCard";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Play } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { getHighlights, createHighlight, deleteHighlight } from "./actions";
import { CloudinaryUpload } from "@/components/admin/CloudinaryUpload";

type Highlight = {
  id: string;
  title?: string;
  description?: string;
  media_url: string;
  media_type: "video" | "image";
  is_verified?: boolean;
  created_at: string;
};

export default function HighlightsPage() {
  const { loading } = useAdminAuth("media");
  const { addToast } = useToast();
  
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    media_url: "",
    media_type: "image" as "image" | "video",
    match_id: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const data = await getHighlights();
        setHighlights(data);
      } catch {
        addToast({ type: "error", title: "Failed to load highlights" });
      } finally {
        setLoadingData(false);
      }
    };
    fetchHighlights();
  }, [addToast]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this highlight?")) return;
    try {
      await deleteHighlight(id);
      setHighlights(highlights.filter(h => h.id !== id));
      addToast({ type: "success", title: "Deleted" });
    } catch {
      addToast({ type: "error", title: "Failed to delete" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createHighlight({
        title: formData.title,
        media_url: formData.media_url,
        media_type: formData.media_type,
        match_id: formData.match_id || undefined,
      });
      setFormData({ title: "", media_url: "", media_type: "image", match_id: "" });
      setShowForm(false);
      const data = await getHighlights();
      setHighlights(data);
      addToast({ type: "success", title: "Highlight added" });
    } catch {
      addToast({ type: "error", title: "Failed to add highlight" });
    } finally {
      setSubmitting(false);
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
          <h1 className="text-2xl font-bold">Manage Highlights</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {showForm ? "Cancel" : "Add Highlight"}
          </button>
        </div>

        {showForm && (
          <AdminCard>
            <h2 className="text-lg font-bold mb-4">Add New Highlight</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg glass border border-white/20 bg-white/5 focus:border-primary focus:outline-none"
                    placeholder="Highlight title"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Media Upload</label>
                  <CloudinaryUpload 
                    value={formData.media_url} 
                    onSuccess={(url) => setFormData({ ...formData, media_url: url })} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Type</label>
                  <select
                    value={formData.media_type}
                    onChange={e => setFormData({ ...formData, media_type: e.target.value as "image" | "video" })}
                    className="w-full px-3 py-2 rounded-lg glass border border-white/20 bg-white/5 focus:border-primary focus:outline-none"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video (YouTube)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Match ID (optional)</label>
                  <input
                    type="text"
                    value={formData.match_id}
                    onChange={e => setFormData({ ...formData, match_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg glass border border-white/20 bg-white/5 focus:border-primary focus:outline-none"
                    placeholder="Related match UUID"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <span className="animate-spin">⟳</span>}
                {submitting ? "Adding..." : "Add Highlight"}
              </button>
            </form>
          </AdminCard>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {highlights.map(h => (
            <AdminCard key={h.id} className="p-4">
              <div className="aspect-video bg-black/20 rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
                {h.media_type === "video" ? (
                  <div className="flex flex-col items-center gap-2 px-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Play className="w-6 h-6 text-primary fill-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground truncate max-w-full">
                      {h.media_url}
                    </span>
                  </div>
                ) : (
                  <img
                    src={h.media_url}
                    alt={h.title || "Highlight"}
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>
              <div className="font-medium mb-2 line-clamp-2">{h.title || "Untitled"}</div>
              <div className="flex gap-2">
                <button className="p-1 glass rounded hover:bg-white/20" title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(h.id)} className="p-1 glass rounded hover:bg-red-500/20" title="Delete">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </AdminCard>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
