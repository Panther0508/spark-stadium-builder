import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { GlassCard } from "@/components/GlassCard";
import { announcements } from "@/lib/mock-data";

export const Route = createFileRoute("/announcements")({
  head: () => ({ meta: [{ title: "Announcements — HallsSports" }] }),
  component: Page,
});

function Page() {
  return (
    <PageShell title="Announcements">
      <div className="space-y-3">
        {announcements.map((a) => (
          <GlassCard key={a.id} className="p-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold">{a.title}</h3>
              <span className="text-[10px] text-muted-foreground">{new Date(a.date).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-muted-foreground">{a.body}</p>
          </GlassCard>
        ))}
      </div>
    </PageShell>
  );
}
