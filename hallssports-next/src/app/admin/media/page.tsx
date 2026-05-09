"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminCard } from "@/components/admin/AdminCard";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState, useEffect } from "react";
import { adminCount } from "@/app/admin/actions";

export default function MediaDashboardPage() {
  const { loading } = useAdminAuth("media");
  const [stats, setStats] = useState({
    highlights: 0,
    lastUpdated: "",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const count = await adminCount('highlights');
        setStats({ highlights: count || 0, lastUpdated: new Date().toLocaleString() });
      } catch {
        setStats({ highlights: 0, lastUpdated: new Date().toLocaleString() });
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout role="media">
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout role="media">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Media Manager Dashboard</h1>
        
        <div className="grid grid-cols-2 gap-4">
          <AdminCard className="p-6 text-center">
            <div className="text-3xl font-bold">{stats.highlights}</div>
            <div className="text-sm text-muted-foreground">Highlights Published</div>
          </AdminCard>
          
          <AdminCard className="p-6 text-center">
            <div className="text-lg font-medium">{stats.lastUpdated}</div>
            <div className="text-sm text-muted-foreground">Last Updated</div>
          </AdminCard>
        </div>
      </div>
    </AdminLayout>
  );
}