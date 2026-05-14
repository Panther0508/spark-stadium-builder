 
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { GlassCard } from "@/components/GlassCard";
import { Skeleton } from "@/components/Skeleton";
import { GlassModal } from "@/components/GlassModal";
import { RefreshCw, AlertOctagon, Database, Activity, ToggleLeft } from "lucide-react";
import { motion } from "framer-motion";

const DEV_KEY = "HallsSports_Dev_2025_Secure";

interface PageData {
  name: string;
  views: number;
  avgTime: string;
  bounce: string;
}

interface CTAData {
  name: string;
  clicks: number;
  trend: "up" | "down";
  percent: number;
}

interface SystemData {
  apiLatency: number;
  errorCount: number;
  dbSize: string;
  supabaseConnected: boolean;
}

interface DevData {
  status: string;
  activeUsers: number;
  pageviewsToday: number;
  lastDeployment: string;
  pages: PageData[];
  ctaClicks: CTAData[];
  system: SystemData;
}

interface InfraMetrics {
  databaseSizeBytes: number;
  databaseSizeMB: number;
  connectionCount: number | null;
  status: 'green' | 'orange' | 'red';
}

interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
}

const MOCK_DEV_DATA: DevData = {
  status: "operational",
  activeUsers: 17,
  pageviewsToday: 1203,
  lastDeployment: "2025-05-08T14:32:00Z",
  pages: [
    { name: "Home", views: 2450, avgTime: "4m 32s", bounce: "42%" },
    { name: "Matches", views: 1890, avgTime: "3m 15s", bounce: "38%" },
    { name: "Live Stats", views: 1234, avgTime: "6m 02s", bounce: "25%" },
    { name: "Community", views: 876, avgTime: "5m 45s", bounce: "31%" },
    { name: "Leaders", views: 654, avgTime: "2m 18s", bounce: "52%" },
    { name: "Players", views: 1123, avgTime: "3m 55s", bounce: "41%" },
    { name: "Standings", views: 987, avgTime: "2m 45s", bounce: "45%" },
    { name: "Champions", views: 432, avgTime: "1m 45s", bounce: "58%" },
    { name: "About", views: 234, avgTime: "1m 12s", bounce: "67%" },
    { name: "Announcements", views: 345, avgTime: "2m 03s", bounce: "54%" },
    { name: "Download", views: 567, avgTime: "1m 34s", bounce: "59%" },
    { name: "Settings", views: 123, avgTime: "1m 56s", bounce: "48%" },
  ],
  ctaClicks: [
    { name: "Download APK", clicks: 845, trend: "up", percent: 12 },
    { name: "Join Pantero Waitlist", clicks: 312, trend: "down", percent: 3 },
    { name: "Community Chat Opened", clicks: 1560, trend: "up", percent: 8 },
    { name: "Player Profile Viewed", clicks: 4200, trend: "up", percent: 15 },
  ],
  system: {
    apiLatency: 87,
    errorCount: 2,
    dbSize: "12.4 MB",
    supabaseConnected: true,
  },
};

export default function DeveloperContent() {
  const searchParams = useSearchParams();
  const devKey = searchParams.get("devkey");
  const [access, setAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [issues, setIssues] = useState<Array<{ type: string; text: string }>>([]);
  const [sortBy, setSortBy] = useState({ key: "views", dir: "desc" });
   const [_errorModal, _setErrorModal] = useState(false);
   const [backupModal, setBackupModal] = useState(false);
   const [_lastBackupTime, setLastBackupTime] = useState<number | null>(null);
   const [data, setData] = useState<DevData | null>(null);
   const [realLogs, setRealLogs] = useState<Array<{ summary: string; timestamp: string; type: string }>>([]);
   const [infraMetrics, setInfraMetrics] = useState<InfraMetrics | null>(null);
   const [metricsLoading, setMetricsLoading] = useState(true);
   const [flags, setFeatureFlags] = useState<FeatureFlag[]>([
     { id: "chat", name: "Community Chat", enabled: true, description: "Enable real-time match chat for users" },
     { id: "realtime", name: "Live Stats Realtime", enabled: true, description: "Stream match updates via Supabase Realtime" },
     { id: "onboarding", name: "Onboarding Flow", enabled: false, description: "Show welcome tour to new visitors" },
   ]);

   // Check backup status from localStorage
   const checkBackupStatus = () => {
     const stored = localStorage.getItem("hallsports_last_backup");
     if (stored) {
       const timestamp = parseInt(stored, 10);
       setLastBackupTime(timestamp);
     }
   };

   useEffect(() => {
     const timer = setTimeout(() => {
       if (devKey === DEV_KEY) {
         setAccess(true);
         setData(MOCK_DEV_DATA);
         checkBackupStatus();
         
         // Fetch real logs
         fetch("/api/admin/dashboard/recent")
           .then(res => res.json())
           .then(logs => setRealLogs(Array.isArray(logs) ? logs : []))
           .catch(console.error);
       }
       setLoading(false);
     }, 10);
     return () => clearTimeout(timer);
   }, [devKey]);

  // Fetch infrastructure health metrics
  useEffect(() => {
    if (!access) return;

    const fetchMetrics = async () => {
      try {
        const res = await fetch(`/api/admin/metrics?devkey=${DEV_KEY}`);
        if (!res.ok) throw new Error("Failed to fetch metrics");
        const json: InfraMetrics = await res.json();
        setInfraMetrics(json);
      } catch (e) {
        console.error("Metrics fetch failed:", e);
      } finally {
        setMetricsLoading(false);
      }
    };

    fetchMetrics();
  }, [access]);

  const runScan = () => {
    setScanning(true);
    setScanComplete(false);
    setTimeout(() => {
      setIssues([
        { type: "warning", text: "Missing alt text on 2 images" },
        { type: "warning", text: "Unused CSS selectors detected (mock)" },
        { type: "warning", text: "Memory leak risk in chat component (mock)" },
        { type: "info", text: "Add lazy loading to large player photos" },
        { type: "info", text: "Consider prefetching match data" },
      ]);
      setScanning(false);
      setScanComplete(true);
    }, 2000);
  };

  const sortedPages = (data?.pages || []).slice().sort((a, b) => {
    const modifier = sortBy.dir === "asc" ? 1 : -1;
    if (sortBy.key === "views") return modifier * (a.views - b.views);
    return modifier * a.name.localeCompare(b.name);
  });

  const toggleFlag = (id: string) => {
    setFeatureFlags(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const _formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  };

  if (!access) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="p-10 text-center max-w-md">
          <div className="w-20 h-20 mx-auto bg-destructive/20 rounded-full grid place-items-center mb-4">
            <AlertOctagon className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold mb-2">403 – Forbidden</h1>
          <p className="text-muted-foreground mb-6">Invalid developer key.</p>
          <Link href="/" className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">
            Go Home
          </Link>
        </GlassCard>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <PageShell title="Developer Console">
        <div className="space-y-4">
          <Skeleton variant="card" height={100} />
          <Skeleton variant="card" height={200} />
          <Skeleton variant="card" height={150} />
          <Skeleton variant="card" height={250} />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Developer Console">
      <div className="space-y-6 pb-20">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <GlassCard className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <p className="text-sm font-bold text-primary">{data.status === "operational" ? "Operational" : "Issues"}</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Active Users</p>
            <p className="text-sm font-bold">{data.activeUsers} now</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Pageviews</p>
            <p className="text-sm font-bold">{data.pageviewsToday.toLocaleString()}</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Deployed</p>
            <p className="text-sm font-bold">May 8, 14:32</p>
          </GlassCard>
        </div>

        {/* Infrastructure Health Section */}
        <GlassCard className="p-4">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Infrastructure Health
          </h3>
          {metricsLoading ? (
            <Skeleton height={80} width="100%" />
          ) : infraMetrics ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                <Database className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">Database Size</div>
                  <div className="text-lg font-bold">{infraMetrics.databaseSizeMB.toFixed(1)} MB</div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        infraMetrics.status === "green"
                          ? "bg-green-500"
                          : infraMetrics.status === "orange"
                          ? "bg-orange-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span className="text-xs" style={{ color: `var(--${infraMetrics.status}-500)` }}>
                      {infraMetrics.status === "green"
                        ? "Healthy"
                        : infraMetrics.status === "orange"
                        ? "Approaching limit"
                        : "Critical"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                <Activity className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">DB Connections</div>
                  <div className="text-lg font-bold">
                    {infraMetrics.connectionCount !== null
                      ? infraMetrics.connectionCount
                      : "N/A"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {infraMetrics.connectionCount !== null && infraMetrics.connectionCount > 150
                      ? "High usage"
                      : "Within limits"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                <RefreshCw className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">API Latency</div>
                  <div className="text-lg font-bold">{data.system.apiLatency} ms</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Unable to load infrastructure metrics.
            </p>
          )}
         </GlassCard>

         {/* Feature Flags */}
         <GlassCard className="p-4">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <ToggleLeft className="h-5 w-5 text-primary" />
            Feature Flags (Runtime Only)
          </h3>
          <div className="space-y-3">
            {flags.map(flag => (
              <div key={flag.id} className="p-4 glass rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm">{flag.name}</div>
                  <div className="text-[10px] text-muted-foreground">{flag.description}</div>
                </div>
                <button 
                  onClick={() => toggleFlag(flag.id)}
                  className={`w-12 h-6 rounded-full transition-all relative ${flag.enabled ? 'bg-primary' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${flag.enabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>

         {/* Bug Scanner */}
         <GlassCard className="p-4">
           <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold">Bug Scanner</h3>
             <button
               onClick={runScan}
               disabled={scanning}
               className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50"
             >
               <RefreshCw className={`h-4 w-4 ${scanning ? "animate-spin" : ""}`} />
               {scanComplete ? "Rescan" : scanning ? "Scanning..." : "Run Scan"}
             </button>
           </div>
           {scanComplete && (
             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-2"
             >
               {issues.map((issue, i) => (
                 <div
                   key={i}
                   className={`p-3 rounded-lg flex items-start gap-3 ${
                     issue.type === "warning"
                       ? "bg-yellow-500/10 border border-yellow-500/30"
                       : "bg-blue-500/10 border border-blue-500/30"
                   }`}
                 >
                   <AlertOctagon
                     className={`h-5 w-5 flex-shrink-0 ${
                       issue.type === "warning" ? "text-yellow-500" : "text-blue-500"
                     }`}
                   />
                   <span className="text-sm">{issue.text}</span>
                 </div>
               ))}
             </motion.div>
           )}
         </GlassCard>

        {/* Page Performance Table */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Page Performance</h3>
            <button
              onClick={() => setSortBy({ key: "views", dir: sortBy.dir === "desc" ? "asc" : "desc" })}
              className="text-xs text-primary hover:underline"
            >
              Sort by Views {sortBy.dir === "desc" ? "↓" : "↑"}
            </button>
          </div>
          <div className="space-y-2">
            {sortedPages.map((page) => (
              <div
                key={page.name}
                className="grid grid-cols-12 gap-4 p-3 rounded-lg bg-white/5 text-sm"
              >
                <div className="col-span-4 font-medium">{page.name}</div>
                <div className="col-span-2 text-center">{page.views.toLocaleString()}</div>
                <div className="col-span-3 text-center text-muted-foreground">{page.avgTime}</div>
                <div className="col-span-3 text-center text-muted-foreground">{page.bounce}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Admin Activity */}
        <GlassCard className="p-4">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Real Admin Activity
          </h3>
          <div className="space-y-2">
            {realLogs.length === 0 ? (
               <p className="text-xs text-muted-foreground italic">No recent activity logged.</p>
            ) : (
              realLogs.map((log, idx) => (
                <div key={idx} className="text-sm border-b border-white/10 pb-2 last:border-0 pt-2 first:pt-0">
                  <div className="flex justify-between items-start gap-4">
                    <span className="font-medium text-xs leading-relaxed">{log.summary}</span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-[10px] text-primary mt-1 uppercase font-bold tracking-wider">{log.type}</div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* Backup How-To Modal */}
      <GlassModal open={backupModal} onClose={() => setBackupModal(false)} title="How to Backup Your Database">
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              Supabase free tier does not include automatic backups. Run this script regularly to protect your data.
            </p>

            <div className="space-y-2">
              <h4 className="font-medium">Step 1: Locate your database connection string</h4>
              <p className="text-xs text-muted-foreground">
                Go to your Supabase dashboard → Project Settings → Database → Connection String.
                Copy the <code className="px-1 py-0.5 rounded bg-white/10">supabase://</code> URI.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Step 2: Set the environment variable</h4>
              <pre className="p-3 rounded-lg bg-black/30 text-xs overflow-x-auto font-mono">
{`# macOS/Linux
export SUPABASE_DATABASE_URL="your-connection-uri"

# Windows PowerShell
$env:SUPABASE_DATABASE_URL="your-connection-uri"`}
              </pre>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Step 3: Run the backup script</h4>
              <pre className="p-3 rounded-lg bg-black/30 text-xs overflow-x-auto font-mono">
{`# macOS/Linux
./scripts/backup-db.sh

# Windows PowerShell
.\scripts\backup-db.ps1`}
              </pre>
            </div>

            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-xs text-yellow-500">
                <strong>Important:</strong> Backups contain all your data. Do not commit them to git.
              </p>
            </div>
          </div>
        </GlassModal>
    </PageShell>
  );
}
