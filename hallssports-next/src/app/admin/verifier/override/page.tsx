"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminCard } from "@/components/admin/AdminCard";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Shield, Trophy, Users, Video, Megaphone, Edit } from "lucide-react";
import { GlassModal } from "@/components/GlassModal";
import { toast } from "sonner";

type SectionType = "matches" | "players" | "highlights" | "announcements";

interface EditableItem {
  id: string;
  type: SectionType;
  title: string;
  data: Record<string, unknown>;
}

const sectionConfig: Record<SectionType, { label: string; icon: React.ReactNode }> = {
  matches: { label: "Matches", icon: <Trophy className="h-5 w-5" /> },
  players: { label: "Players", icon: <Users className="h-5 w-5" /> },
  highlights: { label: "Highlights", icon: <Video className="h-5 w-5" /> },
  announcements: { label: "Announcements", icon: <Megaphone className="h-5 w-5" /> },
};

export default function ManualOverridePage() {
  const { loading: authLoading } = useAdminAuth("verifier");
  const [openSections, setOpenSections] = useState<Set<SectionType>>(new Set());
  const [selectedItem, setSelectedItem] = useState<EditableItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const toggleSection = (section: SectionType) => {
    const newOpen = new Set(openSections);
    if (newOpen.has(section)) newOpen.delete(section);
    else newOpen.add(section);
    setOpenSections(newOpen);
  };

  if (authLoading) {
    return (
      <div className="space-y-4">
        <ShimmerLoader height={600} width="100%" />
      </div>
    );
  }

  return (
    <AdminLayout role="verifier">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <AdminCard highlighted>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-bold">Manual Override</h2>
              <p className="text-sm text-muted-foreground">Edit verified data and unverify to send back to queue</p>
            </div>
          </div>
        </AdminCard>

        {/* Accordion Sections */}
        {(Object.keys(sectionConfig) as SectionType[]).map((section) => (
          <AdminCard key={section}>
            <button onClick={() => toggleSection(section)} className="w-full flex items-center justify-between">
              <div className="flex items-center gap-3">
                {sectionConfig[section].icon}
                <span className="font-bold text-lg">{sectionConfig[section].label}</span>
              </div>
              <span className="text-muted-foreground">{openSections.has(section) ? "▼" : "▶"}</span>
            </button>
            <AnimatePresence>
              {openSections.has(section) && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-4 space-y-2">
                  {/* Mock data for each section */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 glass rounded-lg">
                      <span>{section === "matches" ? `Rangers vs Panthers #${i}` : section === "players" ? `Player ${i}` : section === "highlights" ? `Highlight ${i}` : `Announcement ${i}`}</span>
                      <button
                        onClick={() => {
                          setSelectedItem({
                            id: `${section}-${i}`,
                            type: section,
                            title: `${sectionConfig[section].label} #${i}`,
                            data: { name: "Sample", status: "active" },
                          });
                          setShowEditModal(true);
                        }}
                        className="p-2 rounded-lg hover:bg-white/20"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </AdminCard>
        ))}
      </motion.div>

      {/* Edit Modal */}
      <GlassModal open={showEditModal} onClose={() => setShowEditModal(false)} title={selectedItem?.title || "Edit Item"} maxWidth="lg">
        {selectedItem && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Editing {selectedItem.type}: {selectedItem.id}</p>
            <div className="space-y-3">
              {Object.entries(selectedItem.data).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">{key}</label>
                  <input
                    type="text"
                    defaultValue={String(value)}
                    className="w-full px-3 py-2 glass rounded-lg"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" id="unverify" className="rounded" />
              <label htmlFor="unverify" className="text-sm">Unverify this item (returns to queue)</label>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 glass rounded-lg">
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success("Item saved successfully");
                  setShowEditModal(false);
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </GlassModal>
    </AdminLayout>
  );
}