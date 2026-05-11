"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { PageShell } from "@/components/PageShell";
import { BackButton } from "@/components/BackButton";
import { Bell, Calendar, User } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";

type RawAnnouncement = {
  id: string;
  title: string;
  body: string;
  image_url?: string;
  category?: string;
  author?: string;
  created_at: string;
};

type Announcement = {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  author: string;
  image: string;
  category: string;
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch("/api/announcements");
        if (!res.ok) throw new Error("Failed to load announcements");
        const data: RawAnnouncement[] = await res.json();
        // Transform to UI format
        const transformed = data.map(a => ({
          id: a.id,
          title: a.title,
          date: a.created_at,
          excerpt: a.body.substring(0, 120) + (a.body.length > 120 ? '...' : ''),
          content: a.body,
          author: a.author || "Tournament Committee",
          image: a.image_url || "/images/announcements/default.jpg",
          category: a.category || "News",
        }));
        setAnnouncements(transformed);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load announcements");
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <PageShell title="Announcements">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <ShimmerLoader key={i} height={120} width="100%" />
          ))}
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Announcements">
        <GlassCard className="p-6 text-center">
          <p className="text-red-400 mb-2">Error: {error}</p>
          <button onClick={() => window.location.reload()} className="text-primary underline">Retry</button>
        </GlassCard>
      </PageShell>
    );
  }

  if (announcements.length === 0) {
    return (
      <PageShell title="Announcements">
        <GlassCard className="p-8 text-center">
          <Bell className="h-12 w-12 text-primary/30 mx-auto mb-2" />
          <p className="text-muted-foreground">No announcements yet.</p>
        </GlassCard>
      </PageShell>
    );
  }

  return (
    <PageShell title="Announcements">
      <BackButton />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        {announcements.map((announcement, index) => (
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className="p-4 tilt">
              <div className="flex gap-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={announcement.image}
                    alt={announcement.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded">
                      {announcement.category}
                    </span>
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(announcement.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold mb-1">{announcement.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {announcement.excerpt}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedAnnouncement(announcement);
                      setShowDetail(true);
                    }}
                    className="mt-2 text-primary text-sm hover:underline"
                  >
                    Read more
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetail && selectedAnnouncement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                <Image
                  src={selectedAnnouncement.image}
                  alt={selectedAnnouncement.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded">
                  {selectedAnnouncement.category}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {selectedAnnouncement.author}
                </span>
              </div>
              <h2 className="font-bold text-xl mb-2">{selectedAnnouncement.title}</h2>
               <p className="text-sm text-muted-foreground mb-2">
                 {new Date(selectedAnnouncement.date).toLocaleDateString()}
               </p>
               <p className="text-sm">{sanitizeHtml(selectedAnnouncement.content)}</p>
              <button
                onClick={() => setShowDetail(false)}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}