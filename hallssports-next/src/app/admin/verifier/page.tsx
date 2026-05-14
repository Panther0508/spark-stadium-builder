"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminCard } from "@/components/admin/AdminCard";
import { Skeleton } from "@/components/Skeleton";
import { Activity, CheckCircle, Clock, AlertCircle } from "lucide-react";

type Stats = {
  unverifiedItems: number;
  pendingMatches: number;
  pendingEvents: number;
  approvedToday: number;
};

type RecentActivity = {
  id: string;
  type: string;
  summary: string;
  timestamp: string;
};

export default function VerifierDashboard() {
  const [stats, setStats] = useState<Stats>({
    unverifiedItems: 0,
    pendingMatches: 0,
    pendingEvents: 0,
    approvedToday: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const handlePublishAll = async () => {
    if (!confirm("Are you sure you want to verify and publish ALL pending items?")) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/verify-all", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to publish all");
      const data = await res.json();
      addToast({ type: "success", title: `Successfully published ${data.count} items` });
      
      // Refresh stats
      const statsRes = await fetch("/api/admin/dashboard/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats({
          unverifiedItems: statsData.unverified_items || 0,
          pendingMatches: statsData.pending_matches || 0,
          pendingEvents: statsData.pending_events || 0,
          approvedToday: statsData.approved_today || 0,
        });
      }
    } catch (err) {
      addToast({ type: "error", title: "Failed to publish all items" });
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
    const handleFetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/dashboard/stats", {
          method: "GET",
        });
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        // stats API returns unverified_items, etc.
        setStats({
          unverifiedItems: data.unverified_items || 0,
          pendingMatches: data.pending_matches || 0, // Note: dashboard/stats might not return pending_matches specifically, but it could.
          pendingEvents: data.pending_events || 0,
          approvedToday: data.approved_today || 0,
        });
      } catch (_err) {
        const message = _err instanceof Error ? _err.message : "Unknown error";
        setError(message);
        addToast({ type: "error", title: message });
      } finally {
        setLoading(false);
      }
    };
    handleFetch();

    const fetchRecent = async () => {
      try {
        const res = await fetch("/api/admin/dashboard/recent", {
          method: "GET",
        });
        if (!res.ok) throw new Error("Failed to fetch recent activity");
        const data: RecentActivity[] = await res.json();
        setRecentActivity(data);
      } catch (_err) {
        console.warn("Failed to fetch recent activity", _err);
      }
    };
    fetchRecent();
  }, [addToast]);

  if (loading) {
    return (
      <AdminLayout role="verifier">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout role="verifier">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Verifier Dashboard</h1>
          </div>
          <button
            onClick={handlePublishAll}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Publish All Pending
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminCard className="p-6 text-center border-t-4 border-t-red-500">
            <div className="text-3xl font-bold text-red-500">{stats.unverifiedItems}</div>
            <div className="text-sm text-muted-foreground">Unverified Items</div>
          </AdminCard>
          <AdminCard className="p-6 text-center border-t-4 border-t-yellow-500">
            <div className="text-3xl font-bold text-yellow-500">{stats.pendingMatches}</div>
            <div className="text-sm text-muted-foreground">Pending Matches</div>
          </AdminCard>
          <AdminCard className="p-6 text-center border-t-4 border-t-blue-500">
            <div className="text-3xl font-bold text-blue-500">{stats.pendingEvents}</div>
            <div className="text-sm text-muted-foreground">Pending Events</div>
          </AdminCard>
          <AdminCard className="p-6 text-center border-t-4 border-t-primary">
            <div className="text-3xl font-bold text-primary">{stats.approvedToday}</div>
            <div className="text-sm text-muted-foreground">Approved Today</div>
          </AdminCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminCard className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Actions
            </h3>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No recent activity</p>
              ) : (
                recentActivity.map(activity => (
                  <div key={activity.id} className="p-3 glass rounded-xl border border-white/5 flex items-start gap-3">
                    <div className="mt-1">
                      <Activity className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{activity.summary}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </AdminCard>

          <AdminCard className="p-6">
            <h3 className="font-bold text-lg mb-4">Quick Moderation</h3>
            <div className="grid grid-cols-1 gap-4">
              <a href="/admin/verifier/queue" className="p-4 glass rounded-xl hover:bg-white/10 border border-white/10 flex items-center justify-between transition-all">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>Review Queue</span>
                </div>
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{stats.unverifiedItems}</span>
              </a>
              <a href="/admin/verifier/override" className="p-4 glass rounded-xl hover:bg-white/10 border border-white/10 flex items-center justify-between transition-all">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  <span>Manual Override</span>
                </div>
              </a>
            </div>
          </AdminCard>
        </div>
      </div>
    </AdminLayout>
  );
}
