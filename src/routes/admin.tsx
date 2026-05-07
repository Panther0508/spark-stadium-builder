import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { GlassCard } from "@/components/GlassCard";
import { Lock, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — HallsSports" }] }),
  component: Admin,
});

function Admin() {
  return (
    <PageShell>
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-3">
        <ArrowLeft className="h-4 w-4" /> Back to public view
      </Link>
      <GlassCard className="p-6 text-center" strong>
        <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-primary grid place-items-center ring-glow">
          <Lock className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold mt-3">Admin login</h1>
        <p className="text-sm text-muted-foreground mt-1">Restricted access. Backend coming soon.</p>
        <div className="mt-5 space-y-3 text-left">
          <input placeholder="Email" className="w-full glass rounded-xl px-3 py-2 text-sm bg-transparent outline-none placeholder:text-muted-foreground" />
          <input placeholder="Password" type="password" className="w-full glass rounded-xl px-3 py-2 text-sm bg-transparent outline-none placeholder:text-muted-foreground" />
          <button className="w-full rounded-xl bg-gradient-primary py-2.5 font-semibold text-primary-foreground" disabled>
            Sign in (disabled in UI shell)
          </button>
        </div>
      </GlassCard>
    </PageShell>
  );
}
