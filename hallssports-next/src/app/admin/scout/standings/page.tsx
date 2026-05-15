"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminCard } from "@/components/admin/AdminCard";
import { Skeleton } from "@/components/Skeleton";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";
import { adminSelect } from "@/app/admin/actions";
import { Save } from "lucide-react";

type Standing = {
  id: string;
  team_id: string;
  team: { name: string };
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
};

export default function ScoutStandingsPage() {
  const { loading } = useAdminAuth("scout");
  const { addToast } = useToast();
  
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await adminSelect('standings', {}, { select: '*, team:team_id(name)' }) as Standing[];
        setStandings(data || []);
      } catch (err) {
        addToast({ type: "error", title: "Failed to load standings" });
      } finally {
        setLoadingData(false);
      }
    };
    if (!loading) fetchData();
  }, [loading, addToast]);

  const handleUpdate = async (id: string, field: keyof Standing, value: number) => {
    try {
      const res = await fetch("/api/admin/update-standings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value }),
      });
      if (!res.ok) throw new Error("Failed to update standing");
      setStandings(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
      addToast({ type: "success", title: "Updated" });
    } catch {
      addToast({ type: "error", title: "Update failed" });
    }
  };

  if (loading || loadingData) return <AdminLayout role="scout"><Skeleton className="h-64 w-full" /></AdminLayout>;

  return (
    <AdminLayout role="scout">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Manage Standings</h1>
        <AdminCard className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground uppercase text-xs">
                  <th className="p-2">Team</th>
                  <th className="p-2">P</th>
                  <th className="p-2">W</th>
                  <th className="p-2">D</th>
                  <th className="p-2">L</th>
                  <th className="p-2">GF</th>
                  <th className="p-2">GA</th>
                  <th className="p-2">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map(s => (
                  <tr key={s.id} className="border-t border-white/10">
                    <td className="p-2 font-bold">{s.team?.name || 'Unknown'}</td>
                    {(['played', 'wins', 'draws', 'losses', 'goals_for', 'goals_against', 'points'] as const).map(field => (
                      <td key={field} className="p-2">
                        <input
                          type="number"
                          className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1"
                          defaultValue={s[field]}
                          onBlur={(e) => handleUpdate(s.id, field, parseInt(e.target.value))}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      </div>
    </AdminLayout>
  );
}
