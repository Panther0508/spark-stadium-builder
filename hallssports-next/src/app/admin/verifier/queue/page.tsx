"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";

type QueueItem = {
  id: string;
  type: "match" | "event" | "player" | "announcement" | "highlight";
  summary: string;
  created_at: string;
};

type Tab = "all" | "match" | "event" | "player" | "announcement" | "highlight";

export default function VerifierQueue() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const loadQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch queue");
      const data: QueueItem[] = await res.json();
      setItems(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      addToast({ type: "error", title: message });
    } finally {
      setLoading(false);
    }
};

   useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadQueue();
    }, [loadQueue]);

  const handleApprove = async (id: string) => {
     try {
       const res = await fetch("/api/admin/verify", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ table: "matches", id }), // TODO: determine table from item type
       });
       if (!res.ok) throw new Error("Failed to approve");
       addToast({ type: "success", title: "Item approved" });
       const res2 = await fetch("/api/admin/queue", { method: "POST", headers: { "Content-Type": "application/json" } });
       if (res2.ok) setItems(await res2.json());
     } catch (err) {
       const message = err instanceof Error ? err.message : "Failed to approve";
       setError(message);
       addToast({ type: "error", title: message });
     }
   };

const handleReject = async (id: string) => {
      // TODO: determine table from item type
      try {
        const res = await fetch("/api/admin/reject", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ table: "matches", id }),
        });
        if (!res.ok) throw new Error("Failed to reject");
        addToast({ type: "success", title: "Item rejected" });
        const res2 = await fetch("/api/admin/queue", { method: "POST", headers: { "Content-Type": "application/json" } });
        if (res2.ok) setItems(await res2.json());
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to reject";
        setError(message);
        addToast({ type: "error", title: message });
      }
    };

   const filteredItems = tab === "all"
    ? items 
    : items.filter(item => item.type === tab);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-xl p-4 border border-white/10">
              <div className="h-16 w-full rounded-lg bg-white/20"></div>
              <div className="mt-3 space-y-2">
                <div className="h-4 w-1/2 rounded bg-white/20"></div>
                <div className="h-4 w-3/4 rounded bg-white/20"></div>
                <div className="h-4 w-1/3 rounded bg-white/20"></div>
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
              <h3 className="text-sm font-medium text-red-800">Error loading queue</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <button
                onClick={loadQueue}
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

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="h-12 w-12 text-green-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <p className="text-muted-foreground">All content is verified – nothing to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Verification Queue</h2>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("all")}
          className={`px-3 py-1 rounded-lg text-sm ${tab === "all" ? "bg-primary text-primary-foreground" : "glass"}`}
        >
          All
        </button>
        <button
          onClick={() => setTab("match")}
          className={`px-3 py-1 rounded-lg text-sm ${tab === "match" ? "bg-primary text-primary-foreground" : "glass"}`}
        >
          Matches
        </button>
        <button
          onClick={() => setTab("event")}
          className={`px-3 py-1 rounded-lg text-sm ${tab === "event" ? "bg-primary text-primary-foreground" : "glass"}`}
        >
          Events
        </button>
        <button
          onClick={() => setTab("player")}
          className={`px-3 py-1 rounded-lg text-sm ${tab === "player" ? "bg-primary text-primary-foreground" : "glass"}`}
        >
          Players
        </button>
        <button
          onClick={() => setTab("announcement")}
          className={`px-3 py-1 rounded-lg text-sm ${tab === "announcement" ? "bg-primary text-primary-foreground" : "glass"}`}
        >
          Announcements
        </button>
        <button
          onClick={() => setTab("highlight")}
          className={`px-3 py-1 rounded-lg text-sm ${tab === "highlight" ? "bg-primary text-primary-foreground" : "glass"}`}
        >
          Highlights
        </button>
      </div>

      <div className="space-y-4">
        {filteredItems.map(item => (
          <div key={item.id} className="glass rounded-xl p-4 border border-white/10 flex items-start gap-4">
            <div className="flex-shrink-0 h-10 w-10">
              {/* Type icon */}
              {item.type === "match" && (
                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 0a10 10 0 100 20 10 10 0 000-20zM12.5 5a1 1 0 010 2h-5a1 1 0 100-2h5zM12 9a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )}
              {item.type === "event" && (
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 0a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
                </svg>
              )}
              {item.type === "player" && (
                <svg className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 0a10 10 0 100 20 10 10 0 000-20zM12 6a2 2 0 11-4 0 2 2 0 014 0zm-2 8a4 4 0 100-8 4 4 0 000 8z" />
                </svg>
              )}
              {item.type === "announcement" && (
                <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 0a10 10 0 100 20 10 10 0 000-20zM9 count 3h2v2H9v-2zm0 4h2v2H9v-2z" />
                </svg>
              )}
              {item.type === "highlight" && (
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 0a10 10 0 100 20 10 10 0 000-20zM9.5 4h1v2h-1V4zm0 4h1v2h-1V8zm0 4h1v2h-1v-2z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium">{item.summary}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {/* Relative time */}
                {new Date(item.created_at).toLocaleString()}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleApprove(item.id)}
                  className="px-3 py-1.5 text-sm font-medium bg-green-500 text-green-foreground rounded-lg hover:bg-green-600"
                >
                  Approve & Publish
                </button>
                <button
                  onClick={() => handleReject(item.id)}
                  className="px-3 py-1.5 text-sm font-medium border border-red-500 text-red-500 rounded-lg hover:bg-red-50"
                >
                  Reject / Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}