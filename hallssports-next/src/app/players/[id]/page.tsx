import { getPlayerById, getPlayerRecentMatches } from "@/lib/queries";
import type { Metadata } from "next";
import PlayerProfileClient from "./PlayerProfileClient";
import { PageShell } from "@/components/PageShell";
import { GlassCard } from "@/components/GlassCard";
import { BackButton } from "@/components/BackButton";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const player = await getPlayerById(params.id);

  if (!player) {
    return {
      title: "Player Not Found",
    };
  }

  const title = `${player.name} – Player Profile | HallsSports`;
  const description = `Stats and recent matches for ${player.name} (${player.team}, #${player.number || "N/A"}). Follow their performance in the FUTO hostel tournament.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/players/${player.id}`,
      images: [{ url: player.photo || "/og-image.png" }],
    },
    alternates: {
      canonical: `/players/${player.id}`,
    },
  };
}

export default async function PlayerProfilePage({ params }: { params: { id: string } }) {
  const [player, recentMatches] = await Promise.all([
    getPlayerById(params.id),
    getPlayerRecentMatches(params.id)
  ]);

  if (!player) {
    return (
      <PageShell title="Player Profile">
        <BackButton />
        <GlassCard className="p-6 text-center">
          <p className="text-muted-foreground">Player not found</p>
        </GlassCard>
      </PageShell>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": player.name,
    "image": player.photo || `${SITE_URL}/og-image.png`,
    "jobTitle": "Football Player",
    "memberOf": {
      "@type": "SportsTeam",
      "name": player.team
    },
    "description": `Football player ${player.name} playing for ${player.team} in the FUTO hostel competition.`
  };

  const jsonLdString = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />
      <PlayerProfileClient player={player} recentMatches={recentMatches} />
    </>
  );
}