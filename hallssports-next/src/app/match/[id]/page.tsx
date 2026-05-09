import Link from "next/link";
import { getMatchById, getMatchEvents } from "@/lib/queries";
import type { Metadata } from "next";
import MatchLiveClient from "./MatchLiveClient";
import { PageShell } from "@/components/PageShell";
import { GlassCard } from "@/components/GlassCard";
import { ArrowLeft } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const match = await getMatchById(params.id);

  if (!match) {
    return {
      title: "Match Not Found",
    };
  }

  const title = `${match.home_team} vs ${match.away_team} – Live Score | HallsSports`;
  const description = `Follow the live action between ${match.home_team} and ${match.away_team} in the FUTO hostel tournament.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/match/${match.id}`,
      images: match.image_url ? [{ url: match.image_url }] : undefined,
    },
    alternates: {
      canonical: `${SITE_URL}/match/${match.id}`,
    },
  };
}

export default async function MatchDetailPage({ params }: { params: { id: string } }) {
  const [match, events] = await Promise.all([
    getMatchById(params.id),
    getMatchEvents(params.id),
  ]);

  if (!match) {
    return (
      <PageShell>
        <Link href="/matches" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <ArrowLeft className="h-4 w-4" /> All matches
        </Link>
        <GlassCard className="p-6 text-center">
          <p className="text-red-400 mb-2">Match not found</p>
          <button onClick={() => window.location.reload()} className="text-primary underline">Retry</button>
        </GlassCard>
      </PageShell>
    );
  }

  return <MatchLiveClient initialMatch={match} initialEvents={events} />;
}