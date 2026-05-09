"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { PageShell } from "@/components/PageShell";
import { Bell, Calendar, User } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";

const MOCK_ANNOUNCEMENTS = [
  {
    id: "a1",
    title: "Tournament Kickoff Ceremony",
    date: "2025-01-10T10:00:00Z",
    excerpt: "Join us for the opening ceremony as we kick off the HallsSports tournament...",
    content: "The wait is over! HallsSports tournament officially begins this weekend with 24 teams competing across 6 venues. The opening ceremony at Halls Stadium will feature special guests, player introductions, and the unveiling of the championship trophy.",
    author: "Tournament Committee",
    image: "/images/announcements/kickoff.jpg",
    category: "News",
  },
  {
    id: "a2",
    title: "New Rules for Season 2025",
    date: "2025-01-08T14:30:00Z",
    excerpt: "Updated regulations including VAR implementation and substitution rules...",
    content: "We've introduced several new regulations for the 2025 season. VAR will be implemented for all knockout stage matches. Teams can now make 5 substitutions per match, with an additional substitution allowed during extra time.",
    author: "Rules Committee",
    image: "/images/announcements/rules.jpg",
    category: "Updates",
  },
  {
    id: "a3",
    title: "Youth Coaching Clinic Registration",
    date: "2025-01-05T09:00:00Z",
    excerpt: "Register your kids for the summer coaching program...",
    content: "HallsSports is proud to announce our annual Youth Coaching Clinic, running every Saturday from January 20th to March 30th. Sessions will be led by former professional players and certified coaches. Limited spots available!",
    author: "Community Team",
    image: "/images/announcements/youth.jpg",
    category: "Community",
  },
  {
    id: "a4",
    title: "Top Scorer Award Announced",
    date: "2025-01-03T16:00:00Z",
    excerpt: "James Wilson wins the December Player of the Month...",
    content: "Congratulations to James Wilson of Rangers FC, who has been awarded the December Player of the Month. His 5 goals and 3 assists in December helped his team climb to second place in the standings.",
    author: "Awards Panel",
    image: "/images/announcements/award.jpg",
    category: "Awards",
  },
  {
    id: "a5",
    title: "Weather Advisory for Weekend Matches",
    date: "2025-01-02T08:00:00Z",
    excerpt: "Potential delays due to adverse weather conditions...",
    content: "Please note that weekend matches may be subject to delays due to expected heavy rain. We recommend checking the app before traveling to venues. Updates will be posted on our social media channels.",
    author: "Operations Team",
    image: "/images/announcements/weather.jpg",
    category: "Alerts",
  },
];

type Announcement = typeof MOCK_ANNOUNCEMENTS[0];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 600));
        setAnnouncements(MOCK_ANNOUNCEMENTS);
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