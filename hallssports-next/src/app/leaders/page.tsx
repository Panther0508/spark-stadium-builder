"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { PageShell } from "@/components/PageShell";
import { BackButton } from "@/components/BackButton";
import { Trophy, BarChart3, Shield, CornerDownRight, AlertCircle, BarChart2 } from "lucide-react";
import Image from "next/image";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { supabase } from "@/lib/supabase";

type LeaderItem = {
  id: string;
  name: string;
  team_name: string;
  value: number;
  photo_url?: string | null;
  team_logo?: string | null;
  yellow_cards?: number;
  red_cards?: number;
};

type Tab = "goals" | "assists" | "clean_sheets" | "corners" | "cards";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "goals", label: "Goals", icon: <BarChart3 className="h-4 w-4" /> },
  { key: "assists", label: "Assists", icon: <BarChart3 className="h-4 w-4" /> },
  { key: "clean_sheets", label: "Clean Sheets", icon: <Shield className="h-4 w-4" /> },
  { key: "corners", label: "Corners", icon: <CornerDownRight className="h-4 w-4" /> },
  { key: "cards", label: "Cards", icon: <AlertCircle className="h-4 w-4" /> },
];

export default function LeadersPage() {
  const [data, setData] = useState<Record<Tab, LeaderItem[]>>({
    goals: [], assists: [], clean_sheets: [], corners: [], cards: []
  });
  const [activeTab, setActiveTab] = useState<Tab>("goals");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaders = async () => {
    if (data[activeTab].length > 0) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const functionMap: Record<Tab, string> = {
        goals: "get_top_goals_scorers",
        assists: "get_top_assists",
        clean_sheets: "get_top_clean_sheets",
        corners: "get_top_corners",
        cards: "get_top_cards",
      };
      const rpcName = functionMap[activeTab];
      const { data: result, error } = await supabase.rpc(rpcName, { limit_val: 10 });
      if (error) throw error;
      setData(prev => ({ ...prev, [activeTab]: result || [] }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load leaders");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
     // eslint-disable-next-line react-hooks/set-state-in-effect
     fetchLeaders();
   }, [activeTab]);

  if (loading && data[activeTab].length === 0) {
    return (
      <PageShell title="Leaders">
        <BackButton />
        <div className="space-y-4">
           {[...Array(5)].map((_, i) => <ShimmerLoader key={i} height={60} width="100%" />)}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Leaders">
      <BackButton />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "glass hover:bg-white/10 text-muted-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {error ? (
          <ErrorState message={error} onRetry={fetchLeaders} />
        ) : data[activeTab].length === 0 ? (
          <EmptyState 
            icon={<BarChart2 className="h-12 w-12 text-muted-foreground" />} 
            title={`No ${TABS.find(t => t.key === activeTab)?.label} stats yet.`} 
          />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              {data[activeTab].map((item, index) => (
                <GlassCard key={item.id} className="p-3 flex items-center gap-4 hover:border-primary/30 transition-all">
                  <div className="w-8 flex justify-center items-center">
                    <span className={`text-lg font-black ${index < 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {index + 1}
                    </span>
                  </div>
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted">
                    {item.photo_url ? (
                      <Image src={item.photo_url} alt={item.name} fill className="object-cover" />
                    ) : (
                      <Trophy className="h-5 w-5 m-auto text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{item.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{item.team_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-primary">{item.value}</div>
                    {activeTab === "cards" && (
                      <div className="text-[10px] font-bold text-muted-foreground uppercase">
                        {item.yellow_cards}Y / {item.red_cards}R
                      </div>
                    )}
                  </div>
                </GlassCard>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </PageShell>
  );
}
