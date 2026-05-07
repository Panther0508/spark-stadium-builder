import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { GlassCard } from "@/components/GlassCard";
import { ExternalLink } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — HallsSports" }, { name: "description", content: "About the HallsSports tournament and organizers." }] }),
  component: About,
});

function About() {
  return (
    <PageShell title="About">
      <GlassCard className="p-5 mb-4" strong>
        <p className="text-sm text-muted-foreground leading-relaxed">
          HallsSports is the official live companion to the Halls football tournament — covering every match,
          every goal and every stat in real time. Built for fans, players and organizers.
        </p>
      </GlassCard>
      <h3 className="text-lg font-semibold mb-2">Organizers</h3>
      <GlassCard className="p-4 mb-6">
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>School Head — A. Martinez</li>
          <li>Tournament Director — L. Okafor</li>
          <li>Head of Media — J. Park</li>
          <li>Verifier — R. Singh</li>
        </ul>
      </GlassCard>
      <a href="https://pantero.vercel.app" target="_blank" rel="noreferrer" className="block">
        <button className="w-full rounded-2xl bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] inline-flex items-center justify-center gap-2">
          Powered by Pantero <ExternalLink className="h-4 w-4" />
        </button>
      </a>
    </PageShell>
  );
}
