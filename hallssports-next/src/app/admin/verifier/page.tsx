"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";

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
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const handlePublishAll = async () => {
    addToast({ type: "info", title: "Publish all not implemented yet" });
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
        const data: Stats = await res.json();
        setStats(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
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
      } catch (err) {
        console.warn("Failed to fetch recent activity", err);
      }
    };
    fetchRecent();
  }, [addToast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-medium text-muted-foreground">Loading...</h3>
              <p className="text-2xl font-bold mt-2">--</p>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass rounded-xl p-4 border border-white/10">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded bg-white/20"></div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Activity Item</h4>
                  <p className="text-xs text-muted-foreground mt-1">Just now</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <button
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  fetch("/api/admin/dashboard/stats").then(res => res.ok ? res.json() : Promise.reject()).then(setStats).catch(() => {}).finally(() => setLoading(false));
                }}
                className="mt-3 px-3 py-1.5 text-sm font-medium bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Verifier Dashboard</h1>
        <button
          onClick={handlePublishAll}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Publish All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-medium text-muted-foreground">Unverified Items</h3>
          <p className="text-3xl font-bold mt-2">{stats.unverifiedItems}</p>
        </div>
        <div className="glass rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-medium text-muted-foreground">Pending Matches</h3>
          <p className="text-3xl font-bold mt-2">{stats.pendingMatches}</p>
        </div>
        <div className="glass rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-medium text-muted-foreground">Pending Events</h3>
          <p className="text-3xl font-bold mt-2">{stats.pendingEvents}</p>
        </div>
        <div className="glass rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-medium text-muted-foreground">Approved Today</h3>
          <p className="text-3xl font-bold mt-2">{stats.approvedToday}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <p className="text-muted-foreground">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map(activity => (
              <div key={activity.id} className="glass rounded-xl p-4 border border-white/10 flex items-start gap-3">
                <div className="flex-shrink-0 h-8 w-8">
                  <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 0a10 10 0 100 20 10 10 0 000-20z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium">{activity.summary}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}