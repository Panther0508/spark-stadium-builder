import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Players",
  description: "Explore the profiles of all players participating in the FUTO hostel football tournament. View stats, team affiliations, and individual performances.",
};

export default function PlayersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
