import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { GlassCard } from "@/components/GlassCard";
import { highlights } from "@/lib/mock-data";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/highlights")({
  head: () => ({ meta: [{ title: "Highlights — HallsSports" }, { name: "description", content: "Match highlights, videos and photos." }] }),
  component: Highlights,
});

function Highlights() {
  const [tab, setTab] = useState<"video" | "photo">("video");
  const list = highlights.filter((h) => h.type === tab);

  return (
    <PageShell title="Highlights">
      <div className="glass rounded-2xl p-1 flex mb-4">
        {(["video","photo"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("flex-1 text-xs font-semibold py-2 rounded-xl transition", tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
            {t === "video" ? "Videos" : "Photos"}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {list.map((h) => (
          <GlassCard key={h.id} className="overflow-hidden p-0">
            <div className="relative aspect-video">
              <img src={h.thumb} alt={h.title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              {h.type === "video" && (
                <div className="absolute inset-0 grid place-items-center bg-black/30">
                  <div className="rounded-full bg-primary/90 p-3"><Play className="h-5 w-5 text-primary-foreground fill-current" /></div>
                </div>
              )}
            </div>
            <div className="p-2 text-xs">{h.title}</div>
          </GlassCard>
        ))}
      </div>
    </PageShell>
  );
}
