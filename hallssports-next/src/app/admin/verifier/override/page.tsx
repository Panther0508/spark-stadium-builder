"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminCard } from "@/components/admin/AdminCard";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Shield, Trophy, Users, Video, Megaphone, Edit, RefreshCw } from "lucide-react";
import { GlassModal } from "@/components/GlassModal";
import { toast } from "sonner";
import { adminSelect, adminUpdate } from "@/app/admin/actions";

type SectionType = "matches" | "players" | "highlights" | "announcements";

interface EditableItem {
  id: string;
  type: SectionType;
  title: string;
  data: Record<string, any>;
}

const sectionConfig: Record<SectionType, { label: string; icon: React.ReactNode; table: string }> = {
  matches: { label: "Matches", icon: <Trophy className="h-5 w-5" />, table: "matches" },
  players: { label: "Players", icon: <Users className="h-5 w-5" />, table: "players" },
  highlights: { label: "Highlights", icon: <Video className="h-5 w-5" />, table: "highlights" },
  announcements: { label: "Announcements", icon: <Megaphone className="h-5 w-5" />, table: "announcements" },
};

export default function ManualOverridePage() {
  const { loading: authLoading } = useAdminAuth("verifier");
  const [openSections, setOpenSections] = useState<Set<SectionType>>(new Set());
  const [items, setItems] = useState<Record<SectionType, any[]>>({
    matches: [],
    players: [],
    highlights: [],
    announcements: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<EditableItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [unverifyChecked, setUnverifyChecked] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const [matches, players, highlights, announcements] = await Promise.all([
        adminSelect('matches', { is_verified: true }),
        adminSelect('players', { is_verified: true }),
        adminSelect('highlights', { is_verified: true }),
        adminSelect('announcements', { is_verified: true }),
      ]);
      setItems({
        matches: matches || [],
        players: players || [],
        highlights: highlights || [],
        announcements: announcements || [],
      });
    } catch (e) {
      console.error("Fetch items error:", e);
      toast.error("Failed to load verified data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchItems();
  }, [authLoading]);

  const toggleSection = (section: SectionType) => {
    const newOpen = new Set(openSections);
    if (newOpen.has(section)) newOpen.delete(section);
    else newOpen.add(section);
    setOpenSections(newOpen);
  };

  const handleSave = async (formData: FormData) => {
    if (!selectedItem) return;
    const updates: Record<string, any> = {};
    formData.forEach((value, key) => {
      updates[key] = value;
    });

    if (unverifyChecked) {
      updates.is_verified = false;
    }

    try {
      const table = sectionConfig[selectedItem.type].table;
      await adminUpdate(table, { id: selectedItem.id }, updates);
      toast.success(unverifyChecked ? "Item unverified and sent to queue" : "Item updated successfully");
      setShowEditModal(false);
      fetchItems();
    } catch (e) {
      console.error("Update error:", e);
      toast.error("Failed to save changes");
    }
  };

  if (authLoading || (loading && !Object.values(items).some(a => a.length > 0))) {
    return (
      <AdminLayout role="verifier">
        <div className="space-y-4">
          <ShimmerLoader height={600} width="100%" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout role="verifier">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-bold">Manual Override</h2>
              <p className="text-sm text-muted-foreground">Edit verified data or return to queue</p>
            </div>
          </div>
          <button onClick={fetchItems} className="p-2 rounded-lg glass hover:bg-white/10">
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {(Object.keys(sectionConfig) as SectionType[]).map((section) => (
          <AdminCard key={section}>
            <button onClick={() => toggleSection(section)} className="w-full flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                {sectionConfig[section].icon}
                <span className="font-bold text-lg">{sectionConfig[section].label}</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  {items[section].length} verified
                </span>
              </div>
              <span className="text-muted-foreground transition-transform" style={{ transform: openSections.has(section) ? "rotate(90deg)" : "none" }}>▶</span>
            </button>
            <AnimatePresence>
              {openSections.has(section) && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-4 space-y-2">
                  {items[section].length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No verified {section} found</p>
                  ) : (
                    items[section].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 glass rounded-lg hover:bg-white/5 transition-colors">
                        <div className="flex-1 truncate pr-4">
                          <span className="font-medium">
                            {section === "matches" ? `${item.home_team} vs ${item.away_team}` : section === "players" ? item.name : section === "highlights" ? item.title : item.title}
                          </span>
                          <p className="text-xs text-muted-foreground truncate">{item.id}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedItem({
                              id: item.id,
                              type: section,
                              title: section === "matches" ? `${item.home_team} vs ${item.away_team}` : item.name || item.title,
                              data: item,
                            });
                            setUnverifyChecked(false);
                            setShowEditModal(true);
                          }}
                          className="p-2 rounded-lg hover:bg-primary/20 text-primary transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </AdminCard>
        ))}
      </motion.div>

      <GlassModal open={showEditModal} onClose={() => setShowEditModal(false)} title={selectedItem?.title || "Edit Item"} maxWidth="lg">
        {selectedItem && (
          <form action={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1 custom-scrollbar">
              {Object.entries(selectedItem.data)
                .filter(([key]) => !['id', 'created_at', 'updated_at', 'is_verified'].includes(key))
                .map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-1 capitalize">{key.replace(/_/g, ' ')}</label>
                    <input
                      name={key}
                      type="text"
                      defaultValue={value === null ? "" : String(value)}
                      className="w-full px-3 py-2 glass rounded-lg focus:border-primary focus:outline-none bg-white/5"
                    />
                  </div>
                ))}
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <input
                type="checkbox"
                id="unverify"
                checked={unverifyChecked}
                onChange={(e) => setUnverifyChecked(e.target.checked)}
                className="w-4 h-4 rounded bg-white/10 border-white/20 accent-primary"
              />
              <label htmlFor="unverify" className="text-sm font-medium text-red-400">
                Unverify this item (returns to Verifier Queue)
              </label>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 glass rounded-lg hover:bg-white/10">
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </GlassModal>
    </AdminLayout>
  );
}