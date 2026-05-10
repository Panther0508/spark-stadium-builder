"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminCard } from "@/components/admin/AdminCard";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { CheckCircle, XCircle, Calendar, Users, Megaphone, Video, Trophy } from "lucide-react";
import { toast } from "sonner";
import { adminSelect, adminUpdate, adminDelete } from "@/app/admin/actions";

type ItemType = "match" | "event" | "player" | "announcement" | "highlight";

interface QueueItem {
  id: string;
  type: ItemType;
  summary: string;
  timestamp: string;
}

const TYPE_ICONS: Record<ItemType, React.ReactNode> = {
  match: <Trophy className="h-5 w-5" />,
  event: <Calendar className="h-5 w-5" />,
  player: <Users className="h-5 w-5" />,
  announcement: <Megaphone className="h-5 w-5" />,
  highlight: <Video className="h-5 w-5" />,
};

function getTableName(type: ItemType): string {
  if (type === 'event') return 'match_events';
  return `${type}s`;
}

export default function VerificationQueuePage() {
  const { loading: authLoading } = useAdminAuth("verifier");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<"all" | ItemType>("all");

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const [matches, events, players, announcements, highlights] = await Promise.all([
          adminSelect('matches', { is_verified: false }) as Promise<any[]>,
          adminSelect('match_events', { is_verified: false }) as Promise<any[]>,
          adminSelect('players', { is_verified: false }) as Promise<any[]>,
          adminSelect('announcements', { is_verified: false }) as Promise<any[]>,
          adminSelect('highlights', { is_verified: false }) as Promise<any[]>,
        ]);

        const queueItems: QueueItem[] = [];

        matches.forEach((m: any) => {
          queueItems.push({
            id: `match-${m.id}`,
            type: "match",
            summary: `Match: ${m.home_team} vs ${m.away_team}`,
            timestamp: m.match_date || new Date().toISOString(),
          });
        });
        events.forEach((e: any) => {
          queueItems.push({
            id: `event-${e.id}`,
            type: "event",
            summary: `${e.type === "goal" ? "⚽ Goal" : e.type === "yellow" ? "🟨 Yellow" : "🟥 Red"}: ${e.player_name} at ${e.minute}'`,
            timestamp: e.created_at,
          });
        });
        players.forEach((p: any) => {
          queueItems.push({
            id: `player-${p.id}`,
            type: "player",
            summary: `Player: ${p.name} - ${p.team}`,
            timestamp: p.created_at,
          });
        });
        announcements.forEach((a: any) => {
          queueItems.push({
            id: `announcement-${a.id}`,
            type: "announcement",
            summary: `Announcement: ${a.title}`,
            timestamp: a.created_at,
          });
        });
        highlights.forEach((h: any) => {
          queueItems.push({
            id: `highlight-${h.id}`,
            type: "highlight",
            summary: `Highlight: ${h.title}`,
            timestamp: h.created_at,
          });
        });

        queueItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setItems(queueItems);
      } catch (error) {
        console.error("Error fetching queue:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, []);

  const handleApprove = async (itemId: string) => {
    const [type, id] = itemId.split("-");
    const table = getTableName(type as ItemType);
    try {
      await adminUpdate(table, { id }, { is_verified: true });
      setItems(items.filter((i) => i.id !== itemId));
      toast.success("Item verified successfully");
    } catch {
      toast.error("Failed to verify item");
    }
  };

  const handleBulkApprove = async () => {
    try {
      for (const itemId of selected) {
        const [type, id] = itemId.split("-");
        const table = getTableName(type as ItemType);
        await adminUpdate(table, { id }, { is_verified: true });
      }
      setItems(items.filter((i) => !selected.has(i.id)));
      setSelected(new Set());
      toast.success(`${selected.size} items verified`);
    } catch {
      toast.error("Bulk approval failed");
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Delete this item?")) return;
    const [type, id] = itemId.split("-");
    const table = getTableName(type as ItemType);
    try {
      await adminDelete(table, { id });
      setItems(items.filter((i) => i.id !== itemId));
      toast.success("Item deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filteredItems = activeFilter === "all" ? items : items.filter((i) => i.type === activeFilter);

  if (authLoading) {
    return (
      <div className="space-y-4">
        <ShimmerLoader height={600} width="100%" />
      </div>
    );
  }

  return (
    <AdminLayout role="verifier">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Filter Tabs */}
        <div className="flex gap-2 bg-white/5 p-2 rounded-xl overflow-x-auto">
          {(["all", "match", "event", "player", "announcement", "highlight"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeFilter === filter ? "bg-primary text-white" : "glass hover:bg-white/20"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Bulk Actions */}
        {items.length > 0 && (
          <div className="flex gap-2 mb-4">
            <button 
              onClick={async () => {
                if (!confirm("Approve all pending items?")) return;
                const allIds = new Set(items.map(i => i.id));
                setSelected(allIds);
                await handleBulkApprove();
              }}
              className="px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg text-sm font-bold hover:bg-primary/30 transition-colors"
            >
              Approve All ({items.length})
            </button>
            <button 
              onClick={async () => {
                if (!confirm("Delete all pending items? This cannot be undone.")) return;
                try {
                  for (const item of items) {
                    const [type, id] = item.id.split("-");
                    const table = getTableName(type as ItemType);
                    await adminDelete(table, { id });
                  }
                  setItems([]);
                  toast.success("All items rejected and deleted");
                } catch {
                  toast.error("Bulk rejection failed");
                }
              }}
              className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-sm font-bold hover:bg-red-500/20 transition-colors"
            >
              Reject All
            </button>
          </div>
        )}

        {selected.size > 0 && (
          <AdminCard highlighted>
            <div className="flex items-center justify-between">
              <span className="font-medium">{selected.size} items selected</span>
              <button onClick={handleBulkApprove} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                Approve Selected
              </button>
            </div>
          </AdminCard>
        )}

        {/* Queue Items */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <ShimmerLoader key={i} height={100} width="100%" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <AdminCard className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-lg font-medium">All content is verified – nothing to review!</p>
          </AdminCard>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <AdminCard key={item.id}>
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={(e) => {
                      const newSelected = new Set(selected);
                      if (e.target.checked) newSelected.add(item.id);
                      else newSelected.delete(item.id);
                      setSelected(newSelected);
                    }}
                    className="w-5 h-5 rounded bg-white/10 border-white/20"
                  />
                  <div className="p-2 rounded-lg bg-primary/20">{TYPE_ICONS[item.type]}</div>
                  <div className="flex-1">
                    <p className="font-medium">{item.summary}</p>
                    <p className="text-sm text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors"
                      title="Approve"
                    >
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                      title="Delete"
                    >
                      <XCircle className="h-5 w-5 text-red-400" />
                    </button>
                  </div>
                </div>
              </AdminCard>
            ))}
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
}
