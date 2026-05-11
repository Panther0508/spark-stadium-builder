"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminTable, AdminFormField, AdminModal } from "@/components/admin";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { sanitizeHtml } from "@/lib/sanitize";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { adminSelect, adminInsert } from "@/app/admin/actions";
import { CloudinaryUpload } from "@/components/admin/CloudinaryUpload";

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

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminSelect('announcements', {}, { order: { field: 'created_at', ascending: false } }) as Announcement[];
        setAnnouncements(data);
      } catch {
        addToast({ type: "error", title: "Failed to load" });
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [addToast]);

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Date", accessor: (row: Announcement) => new Date(row.created_at).toLocaleDateString() },
    { header: "Verified", accessor: (row: Announcement) => row.is_verified ? "✓" : "—" },
  ];

  const handleSave = async () => {
    try {
      await adminInsert('announcements', {
        title: formData.title,
        body: sanitizeHtml(formData.body),
        image_url: formData.image_url,
        is_verified: false,
      });
      addToast({ type: "success", title: "Announcement created" });
      setModalOpen(false);
      const data = await adminSelect('announcements', {}, { order: { field: 'created_at', ascending: false } });
      setAnnouncements(data as Announcement[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create";
      addToast({ type: "error", title: message });
    }
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
          <h1 className="text-2xl font-bold">Announcements</h1>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        </div>

        <AdminTable columns={columns} data={announcements} />

        <AdminModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="New Announcement"
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
              <CloudinaryUpload
                value={formData.image_url}
                onSuccess={(url) => setFormData({ ...formData, image_url: url })}
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