"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { ShimmerLoader } from "@/components/ShimmerLoader";
import { PageShell } from "@/components/PageShell";
import { BackButton } from "@/components/BackButton";
import { Smartphone, Monitor, Apple, PlayCircle } from "lucide-react";
import { InstallAppButton } from "@/components/InstallAppButton";

const MOCK_PLATFORM_CONTENT = {
  android: {
    title: "Android App",
    description: "Get the full HallsSports experience on your Android device",
    steps: [
      "Download the APK file below",
      "Open your Downloads folder and tap the APK",
      "Enable 'Install from Unknown Sources' if prompted",
      "Follow the on-screen installation steps",
    ],
    features: ["Live match notifications", "Offline match data", "Push alerts for your favorite teams"],
    apkSize: "15.2 MB",
  },
  ios: {
    title: "iOS App",
    description: "Add HallsSports to your iPhone or iPad home screen",
    steps: [
      "Open Safari on your iOS device",
      "Visit hallssports.com/download",
      "Tap the Share button at the bottom",
      "Select 'Add to Home Screen'",
      "Tap 'Add' to confirm",
    ],
    features: ["Full screen experience", "Siri shortcuts", "iCloud sync"],
    screenshot: "/images/mocks/ios-screenshot.jpg",
  },
  desktop: {
    title: "Desktop / Web App",
    description: "Use HallsSports directly in your browser or install as PWA",
    features: ["Full screen desktop view", "Keyboard shortcuts", "Native app notifications"],
  },
};

type Platform = "android" | "ios" | "desktop";

export default function DownloadPage() {
  const [activePlatform, setActivePlatform] = useState<Platform>("android");
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <PageShell title="Download">
        <div className="space-y-6">
          <ShimmerLoader height={100} width="100%" />
          <ShimmerLoader height={400} width="100%" />
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Download">
        <GlassCard className="p-6 text-center">
          <p className="text-red-400 mb-2">Error: {error}</p>
          <button onClick={() => window.location.reload()} className="text-primary underline">Retry</button>
        </GlassCard>
      </PageShell>
    );
  }

  return (
    <PageShell title="Download">
      <BackButton />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Platform Tabs */}
        <div className="flex gap-2 bg-white/5 p-2 rounded-xl">
          {(["android", "ios", "desktop"] as Platform[]).map(platform => (
            <button
              key={platform}
              onClick={() => setActivePlatform(platform)}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                activePlatform === platform
                  ? "bg-primary text-white"
                  : "glass hover:bg-white/20"
              }`}
            >
              {platform === "android" && <Smartphone className="h-5 w-5 mx-auto mb-1" />}
              {platform === "ios" && <Apple className="h-5 w-5 mx-auto mb-1" />}
              {platform === "desktop" && <Monitor className="h-5 w-5 mx-auto mb-1" />}
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </button>
          ))}
        </div>

        {/* Platform Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePlatform}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
{activePlatform === "android" && (
               <GlassCard className="p-6">
                 <div className="flex items-center gap-2 mb-4">
                   <Smartphone className="h-6 w-6 text-primary" />
                   <h2 className="text-xl font-bold">{MOCK_PLATFORM_CONTENT.android.title}</h2>
                 </div>
                 <p className="text-muted-foreground mb-4">{MOCK_PLATFORM_CONTENT.android.description}</p>
                 <div className="space-y-3 mb-6">
                   <h3 className="font-semibold">Installation Steps:</h3>
                   <ol className="space-y-2">
                     {MOCK_PLATFORM_CONTENT.android.steps.map((step, i) => (
                       <li key={i} className="flex gap-2">
                         <span className="font-bold text-primary">{i + 1}.</span>
                         <span>{step}</span>
                       </li>
                     ))}
                   </ol>
                 </div>
                 <InstallAppButton />
               </GlassCard>
             )}

            {activePlatform === "ios" && (
              <GlassCard className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Apple className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold">{MOCK_PLATFORM_CONTENT.ios.title}</h2>
                </div>
                <p className="text-muted-foreground mb-4">{MOCK_PLATFORM_CONTENT.ios.description}</p>
                <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={MOCK_PLATFORM_CONTENT.ios.screenshot || "/images/mocks/ios-screenshot.jpg"}
                    alt="iOS App Screenshot"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-3 mb-6">
                  <h3 className="font-semibold">Steps to Install:</h3>
                  <ol className="space-y-2">
                    {MOCK_PLATFORM_CONTENT.ios.steps.map((step, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="font-bold text-primary">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </GlassCard>
            )}

            {activePlatform === "desktop" && (
              <GlassCard className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Monitor className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold">{MOCK_PLATFORM_CONTENT.desktop.title}</h2>
                </div>
                <p className="text-muted-foreground mb-4">{MOCK_PLATFORM_CONTENT.desktop.description}</p>
                <button className="w-full py-3 bg-primary text-white font-bold rounded-lg flex items-center justify-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Launch Web App
                </button>
                <p className="text-sm text-muted-foreground mt-4">
                  Tip: Press <kbd className="px-2 py-1 bg-white/10 rounded">Ctrl+Shift+A</kbd> (or <kbd className="px-2 py-1 bg-white/10 rounded">Cmd+Shift+A</kbd> on Mac) to install as PWA
                </p>
              </GlassCard>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Features Comparison */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold mb-4">Feature Comparison</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left pb-2">Feature</th>
                <th className="text-center pb-2">Android</th>
                <th className="text-center pb-2">iOS</th>
                <th className="text-center pb-2">Desktop</th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              <tr className="border-b border-white/10">
                <td className="py-2">Live Notifications</td>
                <td className="text-center text-primary">✓</td>
                <td className="text-center text-primary">✓</td>
                <td className="text-center text-primary">✓</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-2">Offline Mode</td>
                <td className="text-center text-primary">✓</td>
                <td className="text-center text-primary">✓</td>
                <td className="text-center text-muted-foreground">Limited</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-2">Push Alerts</td>
                <td className="text-center text-primary">✓</td>
                <td className="text-center text-primary">✓</td>
                <td className="text-center text-primary">✓</td>
              </tr>
              <tr>
                <td className="py-2">Full Screen Stats</td>
                <td className="text-center text-muted-foreground">—</td>
                <td className="text-center text-muted-foreground">—</td>
                <td className="text-center text-primary">✓</td>
              </tr>
            </tbody>
          </table>
        </GlassCard>
      </motion.div>
    </PageShell>
  );
}