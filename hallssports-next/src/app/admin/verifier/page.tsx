"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminCard } from "@/components/admin/AdminCard";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { GlassModal } from "@/components/GlassModal";
import { toast } from "sonner";
import { adminCount, adminUpdate, adminSelect } from "@/app/admin/actions";
import { Shield, CheckCircle, Clock, AlertTriangle, FileText, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function VerifierDashboardPage() {
  const { loading: authLoading } = useAdminAuth("verifier");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [stats, setStats] = useState({
    unverifiedItems: 0,
    approvedToday: 0,
    pendingMatches: 0,
    pendingEvents: 0,
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [matchesRes, eventsRes, playersRes, announcementsRes, highlightsRes, logsRes] = await Promise.all([
          adminCount('matches', { is_verified: false }),
          adminCount('match_events', { is_verified: false }),
          adminCount('players', { is_verified: false }),
          adminCount('announcements', { is_verified: false }),
          adminCount('highlights', { is_verified: false }),
          adminSelect('admin_logs', {}, { order: { field: 'created_at', ascending: false } }) as Promise<any[]>,
        ]);

        const totalUnverified = (matchesRes || 0) + (eventsRes || 0) + (playersRes || 0) + (announcementsRes || 0) + (highlightsRes || 0);
        
        const approvedToday = (logsRes || []).filter(log => 
          log.action === 'verify' && new Date(log.created_at) >= today
        ).length;

        setStats({
          unverifiedItems: totalUnverified,
          approvedToday,
          pendingMatches: matchesRes || 0,
          pendingEvents: eventsRes || 0,
        });

        setRecentLogs((logsRes || []).slice(0, 5));
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoadingData(false);
      }
    };
    if (!authLoading) fetchStats();
  }, [authLoading]);

  const handlePublishAll = async () => {
    try {
      await Promise.all([
        adminUpdate('matches', { is_verified: false }, { is_verified: true }),
        adminUpdate('match_events', { is_verified: false }, { is_verified: true }),
        adminUpdate('players', { is_verified: false }, { is_verified: true }),
        adminUpdate('announcements', { is_verified: false }, { is_verified: true }),
        adminUpdate('highlights', { is_verified: false }, { is_verified: true }),
      ]);
      toast.success("All items published successfully!");
      setStats(prev => ({ ...prev, unverifiedItems: 0, pendingMatches: 0, pendingEvents: 0 }));
     } catch (err) {
       console.error("Publish error:", err);
       toast.error("Failed to publish items");
     } finally {
      setShowConfirmModal(false);
    }
  };

  if (authLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <AdminLayout role="verifier">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Content Verifier Dashboard</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminCard className="p-4 text-center border-t-4 border-t-yellow-500">
            <div className="text-2xl font-bold text-yellow-500">{loadingData ? "—" : stats.unverifiedItems}</div>
            <div className="text-sm text-muted-foreground">Unverified Items</div>
          </AdminCard>
          <AdminCard className="p-4 text-center border-t-4 border-t-green-500">
            <div className="text-2xl font-bold text-green-500">{loadingData ? "—" : stats.approvedToday}</div>
            <div className="text-sm text-muted-foreground">Approved Today</div>
          </AdminCard>
          <AdminCard className="p-4 text-center border-t-4 border-t-primary">
            <div className="text-2xl font-bold">{loadingData ? "—" : stats.pendingMatches}</div>
            <div className="text-sm text-muted-foreground">Pending Matches</div>
          </AdminCard>
          <AdminCard className="p-4 text-center border-t-4 border-t-blue-500">
            <div className="text-2xl font-bold">{loadingData ? "—" : stats.pendingEvents}</div>
            <div className="text-sm text-muted-foreground">Pending Events</div>
          </AdminCard>
        </div>

        {/* Action Center */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AdminCard highlighted>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-10 h-10 text-primary animate-pulse" />
                  <div>
                    <h3 className="font-bold text-lg">Verification Queue</h3>
                    <p className="text-sm text-muted-foreground">There are {stats.unverifiedItems} items waiting for your approval.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href="/admin/verifier/queue" className="px-4 py-2 glass rounded-lg text-sm font-bold hover:bg-white/10 transition-all">
                    Open Queue
                  </Link>
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    disabled={stats.unverifiedItems === 0}
                    className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    Approve All
                  </button>
                </div>
              </div>
            </AdminCard>

            <AdminCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Recent Verification Activity
                </h3>
                <Link href="/admin/verifier/logs" className="text-xs text-primary hover:underline flex items-center gap-1">
                  View All Logs <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-4">
                {recentLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No recent activity</p>
                ) : (
                  recentLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-3 glass rounded-xl border border-white/5">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-sm capitalize">{log.action} {log.table_name.replace('_', ' ')}</p>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px] md:max-w-full">
                          Record: {log.record_id}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </AdminCard>
          </div>

          <div className="space-y-6">
            <AdminCard className="p-6 h-full">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Verifier Tools
              </h3>
              <div className="space-y-3">
                <Link href="/admin/verifier/override" className="flex items-center justify-between p-4 glass rounded-xl hover:bg-white/10 transition-all group">
                   <div className="flex items-center gap-3">
                     <FileText className="w-5 h-5 text-primary" />
                     <span className="text-sm font-medium">Manual Override</span>
                   </div>
                   <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
                <Link href="/admin/verifier/logs" className="flex items-center justify-between p-4 glass rounded-xl hover:bg-white/10 transition-all group">
                   <div className="flex items-center gap-3">
                     <Clock className="w-5 h-5 text-primary" />
                     <span className="text-sm font-medium">Audit Logs</span>
                   </div>
                   <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              </div>
            </AdminCard>
          </div>
        </div>
      </motion.div>

      <GlassModal open={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Bulk Approval">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to verify all {stats.unverifiedItems} pending items? This will publish everything to the public app immediately.
          </p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 glass rounded-lg hover:bg-white/20 text-sm font-bold">
              Cancel
            </button>
            <button onClick={handlePublishAll} className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-all">
              Confirm & Publish
            </button>
          </div>
        </div>
      </GlassModal>
    </AdminLayout>
  );
}