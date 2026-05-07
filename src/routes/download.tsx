import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { GlassCard } from "@/components/GlassCard";
import { Apple, Smartphone, Monitor, Download as DL } from "lucide-react";

export const Route = createFileRoute("/download")({
  head: () => ({ meta: [{ title: "Download — HallsSports" }, { name: "description", content: "Get HallsSports on Android, iOS or web." }] }),
  component: Download,
});

function Download() {
  const [platform, setPlatform] = useState<"android" | "ios" | "desktop">("desktop");
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua)) setPlatform("android");
    else if (/iphone|ipad|ipod/.test(ua)) setPlatform("ios");
    else setPlatform("desktop");
  }, []);

  return (
    <PageShell title="Download">
      {platform === "android" && (
        <GlassCard className="p-5" strong>
          <Smartphone className="h-8 w-8 text-primary mb-2" />
          <h3 className="font-semibold mb-1">Android</h3>
          <p className="text-sm text-muted-foreground mb-4">Allow installs from unknown sources, then install the APK.</p>
          <button className="w-full rounded-2xl bg-gradient-primary py-3 font-semibold text-primary-foreground inline-flex items-center justify-center gap-2">
            <DL className="h-4 w-4" /> Download Android APK
          </button>
          <p className="text-[11px] text-muted-foreground mt-3">Native push notifications for goals included.</p>
        </GlassCard>
      )}
      {platform === "ios" && (
        <GlassCard className="p-5" strong>
          <Apple className="h-8 w-8 text-primary mb-2" />
          <h3 className="font-semibold mb-1">iOS</h3>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal pl-4">
            <li>Tap the Share icon in Safari.</li>
            <li>Choose "Add to Home Screen".</li>
            <li>Open HallsSports from your home screen.</li>
          </ol>
        </GlassCard>
      )}
      {platform === "desktop" && (
        <GlassCard className="p-5" strong>
          <Monitor className="h-8 w-8 text-primary mb-2" />
          <h3 className="font-semibold mb-1">Desktop</h3>
          <p className="text-sm text-muted-foreground mb-4">Use HallsSports right in your browser.</p>
          <button className="w-full rounded-2xl bg-gradient-primary py-3 font-semibold text-primary-foreground">
            Launch web app
          </button>
        </GlassCard>
      )}
    </PageShell>
  );
}
