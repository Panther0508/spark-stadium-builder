"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ToastProvider";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Skeleton } from "@/components/Skeleton";
import { Check, X, Shield, Users, Trophy, Megaphone, Film, Layers } from "lucide-react";

type QueueItem = {
  id: string;
  type: "match" | "event" | "player" | "announcement" | "highlight";
  summary: string;
  created_at: string;
};

type Tab = "all" | "match" | "event" | "player" | "announcement" | "highlight";

const TABLE_MAP: Record<string, string> = {
  match: "matches",
  event: "match_events",
  player: "players",
  announcement: "announcements",
  highlight: "highlights",
};

export default function VerifierQueue() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToast } = useToast();

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch queue");
      const data: QueueItem[] = await res.json();
      setItems(data);
    } catch (_err) {
      addToast({ type: "error", title: "Error loading queue" });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    let active = true;
    const fetch = async () => {
      await loadQueue();
    };
    if (active) fetch();
    return () => { active = false; };
  }, [loadQueue]);

  const handleApprove = async (item: QueueItem) => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: TABLE_MAP[item.type], id: item.id }),
      });
      if (!res.ok) throw new Error("Failed to approve");
      addToast({ type: "success", title: "Approved & Published" });
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (_err) {
      addToast({ type: "error", title: "Failed to approve" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (item: QueueItem) => {
    if (!confirm("Are you sure you want to reject and DELETE this item?")) return;
    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: TABLE_MAP[item.type], id: item.id }),
      });
      if (!res.ok) throw new Error("Failed to reject");
      addToast({ type: "success", title: "Rejected & Deleted" });
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (_err) {
      addToast({ type: "error", title: "Failed to reject" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAction = async (action: "approve" | "reject") => {
    if (selectedIds.length === 0) return;
    if (action === "reject" && !confirm(`Reject and delete ${selectedIds.length} items?`)) return;
    
    setIsProcessing(true);
    let successCount = 0;
    
    for (const id of selectedIds) {
      const item = items.find(i => i.id === id);
      if (!item) continue;
      
      try {
        const endpoint = action === "approve" ? "/api/admin/verify" : "/api/admin/reject";
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ table: TABLE_MAP[item.type], id: item.id }),
        });
        if (res.ok) successCount++;
      } catch (e) {
        console.error(`Bulk ${action} failed for ${id}`, e);
      }
    }
    
    addToast({ type: "success", title: `Bulk ${action} complete: ${successCount}/${selectedIds.length} successful` });
    setSelectedIds([]);
    loadQueue();
    setIsProcessing(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredItems = tab === "all" ? items : items.filter(item => item.type === tab);

  if (loading) {
    return (
      <AdminLayout role="verifier">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout role="verifier">
      <div className="space-y-6 pb-24">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layers className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Verification Queue</h1>
          </div>
          <div className="text-sm text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/10">
            {items.length} items pending
          </div>
        </div>

        <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar">
          {(["all", "match", "event", "player", "announcement", "highlight"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                tab === t ? "bg-primary text-white shadow-lg shadow-primary/20" : "glass hover:bg-white/10 border border-white/10"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}s
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl border border-white/10">
            <CheckCircleIcon className="w-16 h-16 text-primary/40 mx-auto mb-4" />
            <h3 className="text-xl font-bold">All caught up!</h3>
            <p className="text-muted-foreground mt-2">There are no pending items in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                className={`glass rounded-2xl p-4 border transition-all flex gap-4 ${
                  selectedIds.includes(item.id) ? "border-primary bg-primary/5" : "border-white/10"
                }`}
              >
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 accent-primary"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white/5">
                        {item.type === 'match' && <Trophy className="w-4 h-4 text-blue-400" />}
                        {item.type === 'event' && <Shield className="w-4 h-4 text-green-400" />}
                        {item.type === 'player' && <Users className="w-4 h-4 text-yellow-400" />}
                        {item.type === 'announcement' && <Megaphone className="w-4 h-4 text-primary" />}
                        {item.type === 'highlight' && <Film className="w-4 h-4 text-red-400" />}
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{item.type}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{new Date(item.created_at).toLocaleString()}</span>
                  </div>
                  
                  <h3 className="font-medium text-sm line-clamp-2 mb-4">{item.summary}</h3>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(item)}
                      disabled={isProcessing}
                      className="flex-1 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(item)}
                      disabled={isProcessing}
                      className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sticky Bulk Bar */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-lg glass border border-primary/30 rounded-2xl p-4 flex items-center justify-between shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-sm font-bold">
              <span className="text-primary">{selectedIds.length}</span> items selected
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 text-xs font-bold glass rounded-lg hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBulkAction("approve")}
                className="px-3 py-1.5 text-xs font-bold bg-primary text-white rounded-lg hover:bg-primary/80"
              >
                Approve All
              </button>
              <button
                onClick={() => handleBulkAction("reject")}
                className="px-3 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Reject All
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

import { SVGProps } from "react";

// ... rest of the imports ...

function CheckCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  );
}
