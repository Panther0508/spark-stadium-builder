import { getPlayerById } from "@/lib/queries";
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

  const title = `${player.name} (${player.team}) – Player Profile | HallsSports`;
  const description = `View stats, bio, and career highlights for ${player.name}, playing for ${player.team} in the FUTO hostel competition.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/players/${player.id}`,
      images: player.photo ? [{ url: player.photo }] : undefined,
    },
    alternates: {
      canonical: `${SITE_URL}/players/${player.id}`,
    },
  };
}

export default async function PlayerProfilePage({ params }: { params: { id: string } }) {
  const player = await getPlayerById(params.id);

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

  return <PlayerProfileClient player={player} />;
}