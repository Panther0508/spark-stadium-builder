"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminCard } from "@/components/admin/AdminCard";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState, useEffect } from "react";
import { adminCount, adminSelect } from "@/app/admin/actions";
import { Film, Image as ImageIcon, Users, Trophy, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function MediaDashboardPage() {
  const { loading } = useAdminAuth("media");
  const [stats, setStats] = useState({
    highlights: 0,
    teamsMissingLogo: [] as any[],
    playersMissingPhoto: [] as any[],
    matchesMissingCover: [] as any[],
    lastUpdated: "",
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [highlightsCount, teams, players, matches] = await Promise.all([
          adminCount('highlights'),
          adminSelect('teams'),
          adminSelect('players'),
          adminSelect('matches'),
        ]);

        const teamsMissingLogo = teams.filter((t: any) => !t.logo_url);
        const playersMissingPhoto = players.filter((p: any) => !p.photo);
        const matchesMissingCover = matches.filter((m: any) => !m.image_url);

        setStats({
          highlights: highlightsCount || 0,
          teamsMissingLogo,
          playersMissingPhoto,
          matchesMissingCover,
          lastUpdated: new Date().toLocaleString()
        });
      } catch (e) {
        console.error("Media stats fetch error:", e);
      } finally {
        setLoadingStats(false);
      }
    };
    if (!loading) fetchStats();
  }, [loading]);

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
        <div className="flex items-center gap-3">
          <Film className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Media Manager Dashboard</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminCard className="p-6 text-center border-t-4 border-t-primary">
            <div className="text-3xl font-bold text-primary">{loadingStats ? "—" : stats.highlights}</div>
            <div className="text-sm text-muted-foreground">Highlights Published</div>
          </AdminCard>
          
          <AdminCard className="p-6 text-center border-t-4 border-t-yellow-500">
            <div className="text-3xl font-bold text-yellow-500">{loadingStats ? "—" : stats.teamsMissingLogo.length}</div>
            <div className="text-sm text-muted-foreground">Teams Missing Logo</div>
          </AdminCard>

          <AdminCard className="p-6 text-center border-t-4 border-t-yellow-500">
            <div className="text-3xl font-bold text-yellow-500">{loadingStats ? "—" : stats.playersMissingPhoto.length}</div>
            <div className="text-sm text-muted-foreground">Players Missing Photo</div>
          </AdminCard>
        </div>

        {/* Missing Images Audit */}
        <AdminCard className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold">Content Audit: Missing Media</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Matches */}
            <div>
               <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                 <Trophy className="w-4 h-4" /> Matches ({stats.matchesMissingCover.length})
               </h3>
               <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                 {stats.matchesMissingCover.map(m => (
                   <Link key={m.id} href="/admin/scout/matches" className="block p-3 glass rounded-lg hover:bg-white/10 transition-colors text-xs">
                     <div className="flex justify-between items-center">
                       <span className="font-medium">{m.home_team} vs {m.away_team}</span>
                       <ArrowRight className="w-3 h-3 text-primary" />
                     </div>
                   </Link>
                 ))}
                 {stats.matchesMissingCover.length === 0 && <p className="text-xs text-muted-foreground italic">All matches have covers</p>}
               </div>
            </div>

            {/* Players */}
            <div>
               <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                 <Users className="w-4 h-4" /> Players ({stats.playersMissingPhoto.length})
               </h3>
               <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                 {stats.playersMissingPhoto.map(p => (
                   <Link key={p.id} href="/admin/scout/players" className="block p-3 glass rounded-lg hover:bg-white/10 transition-colors text-xs">
                     <div className="flex justify-between items-center">
                       <span className="font-medium">{p.name} ({p.team})</span>
                       <ArrowRight className="w-3 h-3 text-primary" />
                     </div>
                   </Link>
                 ))}
                 {stats.playersMissingPhoto.length === 0 && <p className="text-xs text-muted-foreground italic">All players have photos</p>}
               </div>
            </div>

            {/* Teams */}
            <div>
               <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                 <ImageIcon className="w-4 h-4" /> Teams ({stats.teamsMissingLogo.length})
               </h3>
               <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                 {stats.teamsMissingLogo.map(t => (
                   <div key={t.id} className="p-3 glass rounded-lg text-xs flex justify-between items-center">
                     <span className="font-medium">{t.name}</span>
                     <span className="text-[10px] text-yellow-500">Logo required</span>
                   </div>
                 ))}
                 {stats.teamsMissingLogo.length === 0 && <p className="text-xs text-muted-foreground italic">All teams have logos</p>}
               </div>
            </div>
          </div>
        </AdminCard>

        <div className="text-center">
          <div className="text-xs text-muted-foreground">Last audit: {stats.lastUpdated}</div>
        </div>
      </div>
    </AdminLayout>
  );
}