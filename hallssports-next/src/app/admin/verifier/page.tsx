"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminCard } from "@/components/admin/AdminCard";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { GlassModal } from "@/components/GlassModal";
import { toast } from "sonner";
import { adminCount, adminUpdate } from "@/app/admin/actions";

export default function VerifierDashboardPage() {
  const { loading: authLoading } = useAdminAuth("verifier");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [stats, setStats] = useState({
    unverifiedItems: 0,
    pendingMatches: 0,
    pendingEvents: 0,
    pendingHighlights: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [matchesRes, eventsRes, playersRes, announcementsRes, highlightsRes] = await Promise.all([
          adminCount('matches', { is_verified: false }),
          adminCount('match_events', { is_verified: false }),
          adminCount('players', { is_verified: false }),
          adminCount('announcements', { is_verified: false }),
          adminCount('highlights', { is_verified: false }),
        ]);

        const total = (matchesRes || 0) + (eventsRes || 0) + (playersRes || 0) + (announcementsRes || 0) + (highlightsRes || 0);

        setStats({
          unverifiedItems: total,
          pendingMatches: matchesRes || 0,
          pendingEvents: eventsRes || 0,
          pendingHighlights: highlightsRes || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  const handlePublishAll = async () => {
    try {
      // Verify all pending items by setting is_verified = true for all records where is_verified = false
      await Promise.all([
        adminUpdate('matches', { is_verified: false }, { is_verified: true }),
        adminUpdate('match_events', { is_verified: false }, { is_verified: true }),
        adminUpdate('players', { is_verified: false }, { is_verified: true }),
        adminUpdate('announcements', { is_verified: false }, { is_verified: true }),
        adminUpdate('highlights', { is_verified: false }, { is_verified: true }),
      ]);
      toast.success("All items published successfully!");
      setStats({
        unverifiedItems: 0,
        pendingMatches: 0,
        pendingEvents: 0,
        pendingHighlights: 0,
      });
     } catch (err) {
       console.error("Publish error:", err);
       toast.error("Failed to publish items");
     } finally {
      setShowConfirmModal(false);
    }
  };

  if (authLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <AdminLayout role="verifier">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminCard className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Unverified Items</p>
            <p className="text-sm font-bold text-primary">{stats.unverifiedItems}</p>
          </AdminCard>
          <AdminCard className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Pending Matches</p>
            <p className="text-sm font-bold">{stats.pendingMatches}</p>
          </AdminCard>
          <AdminCard className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Pending Events</p>
            <p className="text-sm font-bold">{stats.pendingEvents}</p>
          </AdminCard>
          <AdminCard className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Pending Highlights</p>
            <p className="text-sm font-bold">{stats.pendingHighlights}</p>
          </AdminCard>
        </div>

        {/* Publish All Button */}
        <AdminCard highlighted>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">Publish All</h3>
              <p className="text-sm text-muted-foreground">Verify all pending items at once</p>
            </div>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Publish All
            </button>
          </div>
        </AdminCard>

        {/* Recent Activity - Mock (unchanged) */}
        <AdminCard>
          <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { id: 1, action: "Verified Match", detail: "Rangers FC vs Panthers United", time: "5 min ago" },
              { id: 2, action: "Verified Player", detail: "Samuel Effiong - Added to squad", time: "12 min ago" },
              { id: 3, action: "Verified Highlight", detail: "Goal: 72' - Thunder Wolves", time: "25 min ago" },
              { id: 4, action: "Verified Announcement", detail: "Match schedule update", time: "1 hour ago" },
              { id: 5, action: "Verified Event", detail: "Yellow card - City Eagles", time: "2 hours ago" },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                <div>
                  <p className="font-medium">{item.action}</p>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </AdminCard>
      </motion.div>

      {/* Confirmation Modal */}
      <GlassModal open={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirm Publish All">
        <p className="mb-4">Are you sure you want to verify all pending items? This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 glass rounded-lg hover:bg-white/20">
            Cancel
          </button>
          <button onClick={handlePublishAll} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
            Confirm
          </button>
        </div>
      </GlassModal>
    </AdminLayout>
  );
}