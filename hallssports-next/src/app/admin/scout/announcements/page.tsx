"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminFormField, AdminModal } from "@/components/admin";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { sanitizeHtml } from "@/lib/sanitize";
import { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { adminSelect } from "@/app/admin/actions";
import ImageUpload from "@/components/admin/ImageUpload";

type Announcement = {
  id: string;
  title: string;
  body: string;
  image_url?: string;
  is_verified?: boolean;
  created_at: string;
};

export default function AnnouncementsPage() {
  const { loading } = useAdminAuth("scout");
  const { addToast } = useToast();
   
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    image_url: "",
  });
  const [error, setError] = useState<string | null>(null);

const loadData = useCallback(async () => {
     setError(null);
     setLoadingData(true);
     try {
       const data = await adminSelect('announcements', {}, { order: { field: 'created_at', ascending: false } }) as Announcement[];
       setAnnouncements(data);
     } catch (err) {
       const message = err instanceof Error ? err.message : "Failed to load announcements";
       setError(message);
       addToast({ type: "error", title: message });
     } finally {
       setLoadingData(false);
     }
   }, [setError, setLoadingData, addToast]);

  // Load data on mount and set up polling every 30 seconds
  useEffect(() => {
    const handleLoad = async () => {
      await loadData();
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    };
    handleLoad();
  }, [loadData]);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/admin/announcement-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          body: sanitizeHtml(formData.body),
          image_url: formData.image_url,
        })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create announcement');
      }
      
      addToast({ type: "success", title: "Announcement created" });
      setModalOpen(false);
      setFormData({ title: "", body: "", image_url: "" });
      // Data will be refreshed by polling, but we can also trigger an immediate load
      loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create announcement";
      setError(message);
      addToast({ type: "error", title: message });
    }
  };

  const handleRetry = () => {
    setError(null);
    loadData();
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
            <h1 className="text-2xl font-bold">Announcements</h1>
            <div className="flex gap-2">
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading announcements</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout role="scout">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Announcements</h1>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        </div>

        <div className="glass rounded-xl p-4 border border-white/20 backdrop-blur-xl">
          {announcements.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No announcements created yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map(announcement => (
                <div key={announcement.id} className="glass rounded-xl p-4 border border-white/20">
{announcement.image_url ? (
                      <img
                        src={announcement.image_url}
                        alt={announcement.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-black/20 rounded-lg">
                      <span className="text-muted-foreground">No Image</span>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <div className="font-medium text-lg">{announcement.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(announcement.created_at).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-3">
                    {announcement.body}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${announcement.is_verified ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {announcement.is_verified ? "Verified" : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <AdminModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setFormData({ title: "", body: "", image_url: "" });
          }}
          title="New Announcement"
          size="lg"
        >
          <div className="space-y-4">
            <AdminFormField label="Title">
              <input
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20"
              />
            </AdminFormField>
            
            <AdminFormField label="Body">
              <textarea
                value={formData.body}
                onChange={e => setFormData({ ...formData, body: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 min-h-32"
              />
            </AdminFormField>
            
<AdminFormField label="Banner Image">
               <ImageUpload
                 label="Banner Image"
                 value={formData.image_url}
                 onUpload={(url) => setFormData({ ...formData, image_url: url })}
               />
             </AdminFormField>
            
            <button onClick={handleSave} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
              Publish
            </button>
          </div>
        </AdminModal>
      </div>
    </AdminLayout>
  );
}