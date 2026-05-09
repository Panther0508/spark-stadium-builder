/* eslint-disable react/no-unescaped-entities, react-hooks/purity */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { GlassCard } from "@/components/GlassCard";
import { Skeleton } from "@/components/Skeleton";
import { GlassModal } from "@/components/GlassModal";
import { RefreshCw, AlertOctagon, Database, Activity, Shield } from "lucide-react";
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

interface AdminLog {
  action: string;
  time: string;
  type: string;
}

interface DevData {
  status: string;
  activeUsers: number;
  pageviewsToday: number;
  lastDeployment: string;
  pages: PageData[];
  ctaClicks: CTAData[];
  adminLogs: AdminLog[];
  system: SystemData;
}

interface InfraMetrics {
  databaseSizeBytes: number;
  databaseSizeMB: number;
  connectionCount: number | null;
  status: 'green' | 'orange' | 'red';
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
  adminLogs: [
    { action: "Data Scout added goal (Emeka Okafor, 34&apos;)", time: "10 min ago", type: "scout" },
    { action: "Verifier approved match Rangers vs Panthers", time: "25 min ago", type: "verifier" },
    { action: "Data Scout corrected scoreline", time: "1h ago", type: "scout" },
    { action: "Verifier locked live stats", time: "2h ago", type: "verifier" },
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
   const [errorModal, setErrorModal] = useState(false);
   const [backupModal, setBackupModal] = useState(false);
   const [lastBackupTime, setLastBackupTime] = useState<number | null>(null);
   const [data, setData] = useState<DevData | null>(null);
   const [infraMetrics, setInfraMetrics] = useState<InfraMetrics | null>(null);
   const [metricsLoading, setMetricsLoading] = useState(true);

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

  // Format timestamp as "X hours/minutes ago"
  const formatTimeAgo = (timestamp: number) => {
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
      <div className="space-y-6">
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
              Unable to load infrastructure metrics. (Future improvement)
            </p>
          )}
         </GlassCard>

         {/* Data Integrity / Backup Reminder */}
         <GlassCard className="p-4">
           <h3 className="font-bold mb-4 flex items-center gap-2">
             <Shield className="h-5 w-5" />
             Data Integrity
           </h3>
           <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
             <div>
               {lastBackupTime ? (
                 <div>
                   <div className="text-sm font-medium text-green-500">
                     Last backup: {formatTimeAgo(lastBackupTime)}
                   </div>
                   <div className="text-xs text-muted-foreground mt-1">
                     Regular backups are still recommended.
                   </div>
                 </div>
               ) : (
                 <div>
                   <div className="text-sm font-medium text-yellow-500">
                     No backup taken in the last 24 hours
                   </div>
                   <div className="text-xs text-muted-foreground mt-1">
                     Please run scripts/backup-db.sh immediately.
                   </div>
                 </div>
               )}
             </div>
             <div className="flex items-center gap-2">
               <button
                 onClick={() => setBackupModal(true)}
                 className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
               >
                 How to Backup
               </button>
               <button
                 onClick={() => {
                   localStorage.setItem("hallsports_last_backup", Date.now().toString());
                   checkBackupStatus();
                 }}
                 className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
               >
                 Mark Backup Complete
               </button>
             </div>
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

        {/* System Monitor */}
        <GlassCard className="p-4">
          <h3 className="font-bold mb-4">System Monitor</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Supabase</div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium">Connected</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">API Latency</div>
              <div className="text-sm font-medium">{data.system.apiLatency} ms avg</div>
            </div>
          </div>
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

        {/* CTA Tracking */}
        <GlassCard className="p-4">
          <h3 className="font-bold mb-4">CTA Tracking</h3>
          <div className="grid grid-cols-2 gap-4">
            {data.ctaClicks.map((cta, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-white/5">
                <div className="font-medium mb-1">{cta.name}</div>
                <div className="text-sm text-muted-foreground">
                  {cta.clicks.toLocaleString()} clicks
                  <span
                    className={`ml-2 text-xs ${cta.trend === "up" ? "text-green-500" : "text-red-500"}`}
                  >
                    {cta.trend === "up" ? "⬆" : "⬇"} {cta.percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Admin Activity */}
        <GlassCard className="p-4">
          <h3 className="font-bold mb-4">Admin Activity</h3>
          <div className="space-y-2">
            {data.adminLogs.map((log, idx) => (
              <div key={idx} className="text-sm border-b border-white/10 pb-2 last:border-0">
                <div className="flex justify-between">
                  <span>{log.action}</span>
                  <span className="text-muted-foreground">{log.time}</span>
                </div>
                <div className="text-xs text-primary mt-1 capitalize">{log.type}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Error Details Modal (unchanged) */}
        <GlassModal open={errorModal} onClose={() => setErrorModal(false)} title="Error Details">
          <div className="space-y-3 text-sm">
            <div className="glass p-3 rounded-lg">
              <p className="font-mono text-xs">TypeError: Cannot read property 'x' of undefined</p>
              <p className="text-muted-foreground mt-1">app/home/page.tsx:123 - 7h ago</p>
            </div>
            <div className="glass p-3 rounded-lg">
              <p className="font-mono text-xs">Warning: Image without alt text</p>
              <p className="text-muted-foreground mt-1">app/matches/page.tsx:45 - 2d ago</p>
            </div>
          </div>
        </GlassModal>

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

            <div className="space-y-2">
              <h4 className="font-medium">Step 4: Verify the backup</h4>
              <p className="text-xs text-muted-foreground">
                Check the <code className="px-1 py-0.5 rounded bg-white/10">backups/</code> folder for a file named
                <code className="px-1 py-0.5 rounded bg-white/10 ml-1">hallsports_backup_YYYYMMDD_HHMMSS.sql</code>.
                Store it somewhere safe (cloud storage or external drive).
              </p>
            </div>

            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-xs text-yellow-500">
                <strong>Important:</strong> Backups contain all your data. Do not commit them to git.
                Restore with: <code className="px-1 py-0.5 rounded bg-white/10">pg_restore -d $SUPABASE_DATABASE_URL backups/hallsports_backup_YYYYMMDD_HHMMSS.sql</code>
              </p>
            </div>
          </div>
        </GlassModal>
      </div>
    </PageShell>
  );
}