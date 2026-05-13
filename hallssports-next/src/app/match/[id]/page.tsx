import { getMatchById, getMatchEvents } from "@/lib/queries";
import type { Metadata } from "next";
import MatchLiveClient from "./MatchLiveClient";
import { PageShell } from "@/components/PageShell";
import { GlassCard } from "@/components/GlassCard";
import { BackButton } from "@/components/BackButton";

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
      url: `/match/${match.id}`,
      images: [{ url: match.image_url || "/og-image.png" }],
    },
    alternates: {
      canonical: `/match/${match.id}`,
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
        <BackButton />
        <GlassCard className="p-6 text-center">
          <p className="text-red-400 mb-2">Match not found</p>
          <button onClick={() => window.location.reload()} className="text-primary underline">Retry</button>
        </GlassCard>
      </PageShell>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "name": `${match.home_team} vs ${match.away_team}`,
    "startDate": match.match_date,
    "location": {
      "@type": "Place",
      "name": match.venue || "Tournament Grounds",
      "address": "FUTO, Owerri"
    },
    "homeTeam": {
      "@type": "SportsTeam",
      "name": match.home_team
    },
    "awayTeam": {
      "@type": "SportsTeam",
      "name": match.away_team
    }
  };

  const jsonLdString = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />
      <MatchLiveClient initialMatch={match} initialEvents={events} />
    </>
  );
}