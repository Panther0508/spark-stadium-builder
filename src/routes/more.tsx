import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { GlassCard } from "@/components/GlassCard";
import { Users, Trophy, Info, Download, Megaphone, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/more")({
  head: () => ({ meta: [{ title: "More — HallsSports" }] }),
  component: More,
});

const links = [
  { to: "/players", icon: Users, label: "Players" },
  { to: "/champions", icon: Trophy, label: "Champions" },
  { to: "/announcements", icon: Megaphone, label: "Announcements" },
  { to: "/about", icon: Info, label: "About" },
  { to: "/download", icon: Download, label: "Download app" },
] as const;

function More() {
  return (
    <PageShell title="More">
      <div className="space-y-2">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <Link key={l.to} to={l.to}>
              <GlassCard className="p-4 flex items-center gap-3">
                <div className="rounded-xl bg-primary/20 p-2"><Icon className="h-5 w-5 text-primary" /></div>
                <span className="flex-1 font-semibold">{l.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </GlassCard>
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
