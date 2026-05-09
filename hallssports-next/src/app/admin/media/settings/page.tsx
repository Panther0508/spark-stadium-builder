"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";
import { adminSelect, adminUpsert } from "@/app/admin/actions";

type Settings = {
  tournament_name: string;
  about_description: string;
  organizers_description: string;
  honoured_guests: string;
  contributors: string;
  pantero_link: string;
  logo_url?: string;
};

export default function SettingsPage() {
  const { loading } = useAdminAuth("media");
  const { addToast } = useToast();
  
  const [settings, setSettings] = useState<Settings>({
    tournament_name: "HallsSports Tournament",
    about_description: "",
    organizers_description: "",
    honoured_guests: "",
    contributors: "",
    pantero_link: "https://pantero.vercel.app",
  });
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await adminSelect('settings') as Array<{ key: string; value: string }>;
        if (data) {
          const settingsObj = data.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Partial<Settings>);
          setSettings(prev => ({ ...prev, ...settingsObj }));
        }
      } catch {
        // Settings may not exist yet; ignore
      } finally {
        setLoadingData(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
      }));
      await adminUpsert('settings', updates, 'key');
      addToast({ type: "success", title: "Settings saved" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save";
      addToast({ type: "error", title: message });
    } finally {
      setSaving(false);
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
          <h1 className="text-2xl font-bold">Settings & About</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
          >
            Save Changes
          </button>
        </div>

        <AdminCard className="p-6 space-y-4">
          <AdminFormField label="Tournament Name">
            <input
              value={settings.tournament_name}
              onChange={e => setSettings({ ...settings, tournament_name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20"
            />
          </AdminFormField>

          <AdminFormField label="About Description">
            <textarea
              value={settings.about_description}
              onChange={e => setSettings({ ...settings, about_description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 min-h-32"
            />
          </AdminFormField>

          <AdminFormField label="Organizers Description">
            <textarea
              value={settings.organizers_description}
              onChange={e => setSettings({ ...settings, organizers_description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 min-h-24"
            />
          </AdminFormField>

          <AdminFormField label="Pantero Link">
            <input
              value={settings.pantero_link}
              onChange={e => setSettings({ ...settings, pantero_link: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20"
            />
          </AdminFormField>
        </AdminCard>
      </div>
    </AdminLayout>
  );
}