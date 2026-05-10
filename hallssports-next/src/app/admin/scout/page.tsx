"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminCard } from "@/components/admin/AdminCard";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Calendar, Play, Users, Megaphone, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { adminSelect } from "@/app/admin/actions";

export default function ScoutDashboardPage() {
  const { loading } = useAdminAuth("scout");
  const [stats, setStats] = useState({
    matchesToday: 0,
    liveNow: 0,
    unverifiedPlayers: 0,
    pendingAnnouncements: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [matchesData, playersData, announcementsData] = await Promise.all([
          adminSelect('matches') as Promise<any[]>,
          adminSelect('players', { is_verified: false }) as Promise<any[]>,
          adminSelect('announcements', { is_verified: false }) as Promise<any[]>,
        ]);

        const today = new Date().toISOString().split("T")[0];
        const matchesToday = matchesData.filter(m => m.match_date?.startsWith(today)).length;
        const liveNow = matchesData.filter(m => m.status === 'live' || m.status === 'half-time').length;

        setStats({
          matchesToday,
          liveNow,
          unverifiedPlayers: playersData.length,
          pendingAnnouncements: announcementsData.length,
        });
      } catch (e) {
        console.error("Error fetching stats:", e);
      } finally {
        setLoadingStats(false);
      }
    };

    if (!loading) fetchStats();
  }, [loading]);

  if (loading) {
    return (
      <AdminLayout role="scout">
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout role="scout">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Data Scout Dashboard</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminCard className="p-4 text-center border-t-4 border-t-blue-500">
            <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">{loadingStats ? "—" : stats.matchesToday}</div>
            <div className="text-sm text-muted-foreground">Matches Today</div>
          </AdminCard>
          
          <AdminCard className="p-4 text-center border-t-4 border-t-green-500">
            <Play className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">{loadingStats ? "—" : stats.liveNow}</div>
            <div className="text-sm text-muted-foreground">Live Matches</div>
          </AdminCard>
          
          <AdminCard className="p-4 text-center border-t-4 border-t-yellow-500">
            <Users className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">{loadingStats ? "—" : stats.unverifiedPlayers}</div>
            <div className="text-sm text-muted-foreground">Pending Players</div>
          </AdminCard>
          
          <AdminCard className="p-4 text-center border-t-4 border-t-primary">
            <Megaphone className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{loadingStats ? "—" : stats.pendingAnnouncements}</div>
            <div className="text-sm text-muted-foreground">Pending Announcements</div>
          </AdminCard>
        </div>

        <AdminCard className="p-6">
          <h3 className="font-bold text-lg mb-4">Quick Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href="/admin/scout/matches" className="p-4 glass rounded-xl hover:bg-white/10 transition-all border border-white/10 flex items-center justify-between">
               <span>Manage Matches</span>
               <Activity className="w-4 h-4 text-primary" />
            </a>
            <a href="/admin/scout/players" className="p-4 glass rounded-xl hover:bg-white/10 transition-all border border-white/10 flex items-center justify-between">
               <span>Manage Players</span>
               <Users className="w-4 h-4 text-primary" />
            </a>
          </div>
        </AdminCard>
      </div>
    </AdminLayout>
  );
}