"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";
import { adminSelect } from "@/app/admin/actions";
import { Plus, Trash2, Upload, User } from "lucide-react";
import { FullScreenOverlay } from "@/components/FullScreenOverlay";
import ImageUpload from "@/components/admin/ImageUpload";

type Person = {
  name: string;
  role: string;
  photo_url?: string;
};

type EditingPerson = Person & { _index?: number };

type Settings = {
  tournament_name: string;
  tournament_logo: string;
  about_description: string;
  about_mission: string;
  about_vision: string;
  about_goals: string;
  pantero_url: string;
  feedback_url: string;
  organizers: Person[];
  contributors: Person[];
};

export default function SettingsPage() {
  const { loading } = useAdminAuth("media");
  const { addToast } = useToast();
  
  const [settings, setSettings] = useState<Settings>({
    tournament_name: "HallsSports Tournament",
    tournament_logo: "",
    about_description: "",
    about_mission: "",
    about_vision: "",
    about_goals: "",
    pantero_url: "https://pantero.vercel.app",
    feedback_url: "",
    organizers: [],
    contributors: [],
  });
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [currentPanel, setCurrentPanel] = useState<"organizers" | "contributors">("organizers");
  const [editingPerson, setEditingPerson] = useState<EditingPerson | null>(null);
  const [personForm, setPersonForm] = useState({ name: "", role: "", photo_url: "" });

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
           }, {} as Record<string, string | Person[]>);
          setSettings(prev => ({ ...prev, ...settingsObj as Settings }));
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
        { key: "tournament_logo", value: settings.tournament_logo },
        { key: "about_description", value: settings.about_description },
        { key: "about_mission", value: settings.about_mission },
        { key: "about_vision", value: settings.about_vision },
        { key: "about_goals", value: settings.about_goals },
        { key: "pantero_url", value: settings.pantero_url },
        { key: "feedback_url", value: settings.feedback_url },
        { key: "organizers", value: JSON.stringify(settings.organizers) },
        { key: "contributors", value: JSON.stringify(settings.contributors) },
      ];
      console.log('Saving settings:', updates);
      
      const res = await fetch('/api/admin/update-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save settings');
      }
      
      addToast({ type: "success", title: "Settings saved" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save";
      console.error('Save error:', err);
      addToast({ type: "error", title: message });
    } finally {
      setSaving(false);
    }
  };

  const addPerson = () => {
    setEditingPerson(null);
    setPersonForm({ name: "", role: "", photo_url: "" });
    setShowPersonModal(true);
  };

  const editPerson = (person: Person, index: number) => {
    setEditingPerson({ ...person, _index: index });
    setPersonForm({ name: person.name, role: person.role, photo_url: person.photo_url || "" });
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
      photo_url: personForm.photo_url,
    };

    if (editingPerson && editingPerson._index !== undefined) {
      const index = editingPerson._index;
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
            className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50 min-h-[44px]"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <AdminCard className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <AdminFormField label="Tournament Name">
                <input
                  value={settings.tournament_name}
                  onChange={e => setSettings({ ...settings, tournament_name: e.target.value })}
                  className="w-full h-12 px-3 rounded-lg bg-white/5 border border-white/20 focus:border-primary outline-none"
                  placeholder="e.g. HallsSports 2025"
                />
              </AdminFormField>

              <AdminFormField label="Tournament Logo">
                <ImageUpload
                  label="Logo"
                  value={settings.tournament_logo}
                  onUpload={(url) => setSettings({ ...settings, tournament_logo: url })}
                />
              </AdminFormField>
            </div>

            <div className="space-y-4">
               <AdminFormField label="Pantero URL">
                <input
                  value={settings.pantero_url}
                  onChange={e => setSettings({ ...settings, pantero_url: e.target.value })}
                  className="w-full h-12 px-3 rounded-lg bg-white/5 border border-white/20 focus:border-primary outline-none"
                  placeholder="https://pantero.vercel.app"
                />
              </AdminFormField>

              <AdminFormField label="Feedback Form URL">
                <input
                  value={settings.feedback_url}
                  onChange={e => setSettings({ ...settings, feedback_url: e.target.value })}
                  className="w-full h-12 px-3 rounded-lg bg-white/5 border border-white/20 focus:border-primary outline-none"
                  placeholder="https://forms.gle/..."
                />
              </AdminFormField>
            </div>
          </div>

          <AdminFormField label="About Description">
            <textarea
              value={settings.about_description}
              onChange={e => setSettings({ ...settings, about_description: e.target.value })}
              className="w-full min-h-32 px-3 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-primary outline-none resize-none"
              placeholder="Tell us about the tournament..."
            />
          </AdminFormField>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AdminFormField label="Our Mission">
              <textarea
                value={settings.about_mission}
                onChange={e => setSettings({ ...settings, about_mission: e.target.value })}
                className="w-full min-h-32 px-3 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-primary outline-none resize-none"
                placeholder="Our mission is to..."
              />
            </AdminFormField>
            <AdminFormField label="Our Vision">
              <textarea
                value={settings.about_vision}
                onChange={e => setSettings({ ...settings, about_vision: e.target.value })}
                className="w-full min-h-32 px-3 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-primary outline-none resize-none"
                placeholder="Our vision is to..."
              />
            </AdminFormField>
            <AdminFormField label="Our Goals">
              <textarea
                value={settings.about_goals}
                onChange={e => setSettings({ ...settings, about_goals: e.target.value })}
                className="w-full min-h-32 px-3 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-primary outline-none resize-none"
                placeholder="Our goals are to..."
              />
            </AdminFormField>
          </div>
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
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-black/20 flex-shrink-0">
                    {person.photo_url ? (
                      <img src={person.photo_url} alt={person.name} className="max-w-full max-h-full object-cover" />
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
                    onClick={() => { setCurrentPanel("organizers"); editPerson(person, index); }}
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
              className="w-full min-h-[44px] px-4 py-2 glass rounded-lg flex items-center justify-center gap-2 border border-white/10 hover:bg-white/5"
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
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-black/20 flex-shrink-0">
                    {person.photo_url ? (
                      <img src={person.photo_url} alt={person.name} className="max-w-full max-h-full object-cover" />
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
                    onClick={() => { setCurrentPanel("contributors"); editPerson(person, index); }}
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
              className="w-full min-h-[44px] px-4 py-2 glass rounded-lg flex items-center justify-center gap-2 border border-white/10 hover:bg-white/5"
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
                className="w-full h-12 px-3 rounded-lg bg-white/5 border border-white/20 focus:border-primary outline-none"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Role</label>
              <input
                type="text"
                value={personForm.role}
                onChange={e => setPersonForm({ ...personForm, role: e.target.value })}
                className="w-full h-12 px-3 rounded-lg bg-white/5 border border-white/20 focus:border-primary outline-none"
                placeholder="e.g., Tournament Director"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Photo</label>
              <ImageUpload
                label="Photo"
                value={personForm.photo_url}
                onUpload={(url) => setPersonForm({ ...personForm, photo_url: url })}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowPersonModal(false)}
                className="flex-1 min-h-[44px] px-4 py-2 rounded-lg glass hover:bg-white/10"
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
