"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { PageShell } from "@/components/PageShell";
import { BackButton } from "@/components/BackButton";
import { Trophy, BarChart3, Shield, CornerDownRight, AlertCircle } from "lucide-react";
import Image from "next/image";

type LeaderItem = {
  id: string;
  name?: string;
  team: string;
  photoUrl?: string;
  teamLogo?: string;
  value?: number;
  yellow?: number;
  red?: number;
  total?: number;
};

type StandingsData = { standings: Array<{ team: string }>; leaders: LeadersData };

type LeadersData = {
  goals: LeaderItem[];
  assists: LeaderItem[];
  cleanSheets: LeaderItem[];
  corners: LeaderItem[];
  cards: LeaderItem[];
};

type Tab = "goals" | "assists" | "cleanSheets" | "corners" | "cards";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "goals", label: "Goals", icon: <BarChart3 className="h-4 w-4" /> },
  { key: "assists", label: "Assists", icon: <BarChart3 className="h-4 w-4" /> },
  { key: "cleanSheets", label: "Clean Sheets", icon: <Shield className="h-4 w-4" /> },
  { key: "corners", label: "Corners", icon: <CornerDownRight className="h-4 w-4" /> },
  { key: "cards", label: "Cards", icon: <AlertCircle className="h-4 w-4" /> },
];

export default function LeadersPage() {
  const [data, setData] = useState<LeadersData | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("goals");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await fetch("/api/standings");
        if (!res.ok) throw new Error("Failed to fetch standings");
        const json: { standings: StandingsData; leaders: LeadersData } = await res.json();
        setData(json.leaders);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load leaders");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  if (loading) {
    return (
      <PageShell title="Leaders">
        <ShimmerLoader height={300} width="100%" />
      </PageShell>
    );
  }

  if (error || !data) {
    return (
      <PageShell title="Leaders">
        <GlassCard className="p-6 text-center">
          <p className="text-red-400 mb-2">Error: {error || "Unknown error"}</p>
          <button onClick={() => window.location.reload()} className="text-primary underline">
            Retry
          </button>
        </GlassCard>
      </PageShell>
    );
  }

  const currentItems = data[activeTab];

  return (
    <PageShell title="Leaders">
      <BackButton />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-primary text-white"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {currentItems.map((item, index) => (
              <GlassCard key={item.id} className="p-3 flex items-center gap-4">
                <div className="w-8 text-center">
                  <span
                    className={`text-lg font-bold ${
                      index === 0
                        ? "text-yellow-500"
                        : index === 1
                        ? "text-gray-300"
                        : index === 2
                        ? "text-amber-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </span>
                </div>
                {item.photoUrl ? (
                  <Image
                    src={item.photoUrl}
                    alt={item.name || item.team}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : item.teamLogo ? (
                  <Image
                    src={item.teamLogo}
                    alt={item.team}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{item.name || item.team}</div>
                  <div className="text-xs text-muted-foreground truncate">{item.team}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-primary">{item.value ?? item.total ?? 0}</div>
                  {activeTab === "cards" && (
                    <div className="text-xs text-muted-foreground">
                      {item.yellow ?? 0}Y / {item.red ?? 0}R
                    </div>
                  )}
                </div>
                {index < 3 && <Trophy className="h-5 w-5 text-yellow-500" />}
              </GlassCard>
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </PageShell>
  );
}