"use client";
/* eslint-disable @next/next/no-img-element */

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminCard } from "@/components/admin/AdminCard";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Play, GripVertical } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { getHighlights } from "./actions";
import { extractYouTubeID } from "@/lib/extractYouTubeID";
import { Reorder, useDragControls } from "framer-motion";

type Highlight = {
  id: string;
  title?: string;
  description?: string;
  media_url: string;
  media_type: "video" | "image";
  match_id?: string;
  is_verified?: boolean;
  created_at: string;
};

export default function HighlightsPage() {
  const { loading } = useAdminAuth("media");
  const { addToast } = useToast();
  
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    media_url: "",
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
      const res = await fetch('/api/admin/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'highlights', id })
      });
      if (!res.ok) throw new Error('Delete failed');
      setHighlights(highlights.filter(h => h.id !== id));
      addToast({ type: "success", title: "Deleted" });
    } catch {
      addToast({ type: "error", title: "Failed to delete" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const youtubeId = extractYouTubeID(formData.media_url);
    if (!youtubeId) {
      addToast({ type: "error", title: "Invalid YouTube URL" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/update-highlight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          title: formData.title,
          media_url: formData.media_url,
          media_type: 'video',
          match_id: formData.match_id || undefined,
        })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save highlight');
      }
      
      setFormData({ title: "", media_url: "", match_id: "" });
      setShowForm(false);
      setEditingId(null);
      const data = await getHighlights();
      setHighlights(data);
      addToast({ type: "success", title: editingId ? "Highlight updated" : "Highlight added" });
    } catch (err) {
      addToast({ type: "error", title: err instanceof Error ? err.message : "Failed to save highlight" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (h: Highlight) => {
    setEditingId(h.id);
    setFormData({
      title: h.title || "",
      media_url: h.media_url,
      match_id: h.match_id || "",
    });
    setShowForm(true);
  };

  const handleReorder = async (newOrder: Highlight[]) => {
    setHighlights(newOrder);
    try {
      const updates = newOrder.map((h, index) => ({ id: h.id, order_index: index }));
      await fetch('/api/admin/highlights-reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.error("Failed to save order", e);
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
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setEditingId(null);
                setFormData({ title: "", media_url: "", match_id: "" });
              } else {
                setShowForm(true);
              }
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {showForm ? "Cancel" : "Add Highlight"}
          </button>
        </div>

        {showForm && (
          <AdminCard>
            <h2 className="text-lg font-bold mb-4">
              {editingId ? "Edit Highlight" : "Add New Highlight"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Highlight Caption / Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg glass border border-white/20 bg-white/5 focus:border-primary focus:outline-none"
                    placeholder="Enter highlight caption"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">YouTube Link</label>
                  <input
                    type="text"
                    value={formData.media_url}
                    onChange={e => setFormData({ ...formData, media_url: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg glass border border-white/20 bg-white/5 focus:border-primary focus:outline-none"
                    placeholder="Paste YouTube link (e.g., https://youtu.be/...)"
                  />
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
                className="px-6 py-2 bg-primary text-white rounded-lg font-bold disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <span className="animate-spin">⟳</span>}
                {editingId ? "Update Highlight" : "Add Highlight"}
              </button>
            </form>
          </AdminCard>
        )}

        <Reorder.Group
          axis="y"
          values={highlights}
          onReorder={handleReorder}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {highlights.map(h => (
            <ReorderItem 
              key={h.id} 
              highlight={h} 
              onEdit={() => handleEdit(h)}
              onDelete={() => handleDelete(h.id)} 
            />
          ))}
        </Reorder.Group>
      </div>
    </AdminLayout>
  );
}

function ReorderItem({ highlight, onEdit, onDelete }: { highlight: Highlight; onEdit: () => void; onDelete: () => void }) {
  const controls = useDragControls();
  const youtubeId = extractYouTubeID(highlight.media_url);

  return (
    <Reorder.Item
      value={highlight}
      dragListener={false}
      dragControls={controls}
      className="list-none"
    >
      <AdminCard className="p-4 relative">
        <div 
          onPointerDown={(e) => controls.start(e)}
          className="absolute top-2 right-2 p-1.5 glass rounded-lg cursor-grab active:cursor-grabbing z-10 hover:bg-white/10"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>

        <div className="aspect-video bg-black/20 rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
          {highlight.media_type === "video" && youtubeId ? (
            <img 
              src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
              alt={highlight.title || "Highlight"}
              className="w-full h-full object-cover"
            />
          ) : highlight.media_type === "image" ? (
            <img
              src={highlight.media_url}
              alt={highlight.title || "Highlight"}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Play className="w-6 h-6 text-primary fill-primary" />
              </div>
              <span className="text-xs text-muted-foreground truncate max-w-full">
                {highlight.media_url}
              </span>
            </div>
          )}
          {highlight.media_type === "video" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Play className="w-10 h-10 text-white fill-white opacity-80" />
            </div>
          )}
        </div>
        <div className="font-medium mb-2 line-clamp-2 pr-8">{highlight.title || "Untitled"}</div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="p-1 glass rounded hover:bg-white/20" title="Edit">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1 glass rounded hover:bg-red-500/20" title="Delete">
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </AdminCard>
    </Reorder.Item>
  );
}
