"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";
import { adminSelect, adminUpsert } from "@/app/admin/actions";
import { Plus, Trash2, Upload, User } from "lucide-react";
import { FullScreenOverlay } from "@/components/FullScreenOverlay";

type Person = {
  name: string;
  role: string;
  photo?: string;
};

type Settings = {
  tournament_name: string;
  about_description: string;
  organizers: Person[];
  contributors: Person[];
  pantero_link: string;
};

export default function SettingsPage() {
  const { loading } = useAdminAuth("media");
  const { addToast } = useToast();
  
  const [settings, setSettings] = useState<Settings>({
    tournament_name: "HallsSports Tournament",
    about_description: "",
    organizers: [],
    contributors: [],
    pantero_link: "https://pantero.vercel.app",
  });
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [currentPanel, setCurrentPanel] = useState<"organizers" | "contributors">("organizers");
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [personForm, setPersonForm] = useState({ name: "", role: "", photo: "" });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await adminSelect('settings') as Array<{ key: string; value: string }>;
        if (data) {
          const settingsObj = data.reduce((acc, s) => {
            if (s.key === 'organizers' || s.key === 'contributors') {
              try {
                acc[s.key] = JSON.parse(s.value);
              } catch {
                acc[s.key] = [];
              }
            } else {
              acc[s.key] = s.value;
            }
            return acc;
          }, {} as Partial<Settings>);
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
      const updates = [
        { key: "tournament_name", value: settings.tournament_name },
        { key: "about_description", value: settings.about_description },
        { key: "organizers", value: JSON.stringify(settings.organizers) },
        { key: "contributors", value: JSON.stringify(settings.contributors) },
        { key: "pantero_link", value: settings.pantero_link },
      ];
      await adminUpsert('settings', updates, 'key');
      addToast({ type: "success", title: "Settings saved" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save";
      addToast({ type: "error", title: message });
    } finally {
      setSaving(false);
    }
  };

  const addPerson = () => {
    setEditingPerson(null);
    setPersonForm({ name: "", role: "", photo: "" });
    setShowPersonModal(true);
  };

  const editPerson = (person: Person, index: number) => {
    setEditingPerson({ ...person, _index: index });
    setPersonForm({ name: person.name, role: person.role, photo: person.photo || "" });
    setShowPersonModal(true);
  };

  const removePerson = (panel: "organizers" | "contributors", index: number) => {
    if (confirm("Remove this person?")) {
      setSettings({
        ...settings,
        [panel]: settings[panel].filter((_, i) => i !== index),
      });
    }
  };

  const savePerson = () => {
    if (!personForm.name || !personForm.role) return;
    
    const person: Person = {
      name: personForm.name,
      role: personForm.role,
      photo: personForm.photo,
    };

    if (editingPerson && (editingPerson as any)._index !== undefined) {
      const index = (editingPerson as any)._index;
      const newPeople = [...settings[currentPanel]];
      newPeople[index] = person;
      setSettings({ ...settings, [currentPanel]: newPeople });
    } else {
      setSettings({ ...settings, [currentPanel]: [...settings[currentPanel], person] });
    }
    setShowPersonModal(false);
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
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 min-h-[44px]"
          >
            Save Changes
          </button>
        </div>

        <AdminCard className="p-6 space-y-4">
          <AdminFormField label="Tournament Name">
            <input
              value={settings.tournament_name}
              onChange={e => setSettings({ ...settings, tournament_name: e.target.value })}
              className="w-full h-12 px-3 rounded-lg bg-white/5 border border-white/20"
            />
          </AdminFormField>

          <AdminFormField label="About Description">
            <textarea
              value={settings.about_description}
              onChange={e => setSettings({ ...settings, about_description: e.target.value })}
              className="w-full min-h-32 px-3 py-2 rounded-lg bg-white/5 border border-white/20"
            />
          </AdminFormField>

          <AdminFormField label="Pantero Link">
            <input
              value={settings.pantero_link}
              onChange={e => setSettings({ ...settings, pantero_link: e.target.value })}
              className="w-full h-12 px-3 rounded-lg bg-white/5 border border-white/20"
            />
          </AdminFormField>
        </AdminCard>

        <div className="border-t border-primary/30 my-6" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Tournament Organizers</h2>
            <p className="text-sm text-muted-foreground">The official team running the tournament</p>
          </div>
          <div className="space-y-3">
            {settings.organizers.map((person, index) => (
              <div key={index} className="glass rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-black/20 flex-shrink-0">
                  {person.photo ? (
                    <img src={person.photo} alt={person.name} className="max-w-full max-h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-muted-foreground m-auto" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{person.name}</div>
                  <div className="text-sm text-primary">{person.role}</div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => editPerson(person, index)}
                    className="p-2 rounded-lg hover:bg-white/10 min-h-[44px] min-w-[44px]"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removePerson("organizers", index)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 min-h-[44px] min-w-[44px]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => { setCurrentPanel("organizers"); addPerson(); }}
              className="w-full min-h-[44px] px-4 py-2 glass rounded-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Organizer
            </button>
          </div>
        </div>

        <div className="border-t border-primary/30 my-6" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Contributors</h2>
            <p className="text-sm text-muted-foreground">People who helped build and run HallsSports</p>
          </div>
          <div className="space-y-3">
            {settings.contributors.map((person, index) => (
              <div key={index} className="glass rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-black/20 flex-shrink-0">
                  {person.photo ? (
                    <img src={person.photo} alt={person.name} className="max-w-full max-h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-muted-foreground m-auto" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{person.name}</div>
                  <div className="text-sm text-primary">{person.role}</div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => editPerson(person, index)}
                    className="p-2 rounded-lg hover:bg-white/10 min-h-[44px] min-w-[44px]"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removePerson("contributors", index)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 min-h-[44px] min-w-[44px]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => { setCurrentPanel("contributors"); addPerson(); }}
              className="w-full min-h-[44px] px-4 py-2 glass rounded-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Contributor
            </button>
          </div>
        </div>

        <FullScreenOverlay
          isOpen={showPersonModal}
          onClose={() => setShowPersonModal(false)}
        >
          <div className="space-y-4">
            <h2 className="text-xl font-bold">
              {editingPerson ? "Edit Person" : "Add Person"}
            </h2>
            <div>
              <label className="block text-sm font-medium mb-1.5">Name</label>
              <input
                type="text"
                value={personForm.name}
                onChange={e => setPersonForm({ ...personForm, name: e.target.value })}
                className="w-full h-12 px-3 rounded-lg bg-white/5 border border-white/20"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Role</label>
              <input
                type="text"
                value={personForm.role}
                onChange={e => setPersonForm({ ...personForm, role: e.target.value })}
                className="w-full h-12 px-3 rounded-lg bg-white/5 border border-white/20"
                placeholder="e.g., Tournament Director"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Photo URL</label>
              <input
                type="url"
                value={personForm.photo}
                onChange={e => setPersonForm({ ...personForm, photo: e.target.value })}
                className="w-full h-12 px-3 rounded-lg bg-white/5 border border-white/20"
                placeholder="https://cloudinary.com/..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowPersonModal(false)}
                className="flex-1 min-h-[44px] px-4 py-2 rounded-lg glass hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={savePerson}
                disabled={!personForm.name || !personForm.role}
                className="flex-1 min-h-[44px] px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </FullScreenOverlay>
      </div>
    </AdminLayout>
  );
}