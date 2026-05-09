"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminCard } from "@/components/admin/AdminCard";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Calendar, Play, Users, Megaphone } from "lucide-react";
import { useEffect, useState } from "react";
import { adminSelect } from "@/app/admin/actions";

export default function ScoutDashboardPage() {
  const { loading } = useAdminAuth("scout");
  const [stats, setStats] = useState({
    matchesToday: 0,
    liveNow: 0,
    players: 0,
    announcementsPending: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [matchesData, playersData, announcementsData] = await Promise.all([
          adminSelect('matches') as Promise<any[]>,
          adminSelect('players') as Promise<any[]>,
          adminSelect('announcements', { is_verified: false }) as Promise<any[]>,
        ]);

        const today = new Date().toISOString().split("T")[0];
        const matchesToday = matchesData.filter(m => m.match_date?.startsWith(today)).length;
        const liveNow = matchesData.filter(m => m.status === 'live').length;
        const playersCount = playersData.length;
        const announcementsPending = announcementsData.length;

        setStats({
          matchesToday,
          liveNow,
          players: playersCount,
          announcementsPending,
        });
      } catch (e) {
        console.error("Error fetching stats:", e);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

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
        <h1 className="text-2xl font-bold">Data Scout Dashboard</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AdminCard className="p-4 text-center">
            <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{loadingStats ? "—" : stats.matchesToday}</div>
            <div className="text-sm text-muted-foreground">Matches Today</div>
          </AdminCard>
          
          <AdminCard className="p-4 text-center">
            <Play className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{loadingStats ? "—" : stats.liveNow}</div>
            <div className="text-sm text-muted-foreground">Live Now</div>
          </AdminCard>
          
          <AdminCard className="p-4 text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{loadingStats ? "—" : stats.players}</div>
            <div className="text-sm text-muted-foreground">Players</div>
          </AdminCard>
          
          <AdminCard className="p-4 text-center">
            <Megaphone className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{loadingStats ? "—" : stats.announcementsPending}</div>
            <div className="text-sm text-muted-foreground">Pending Announcements</div>
          </AdminCard>
        </div>
      </div>
    </AdminLayout>
  );
}