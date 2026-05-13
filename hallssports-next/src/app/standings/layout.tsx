import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Standings",
  description: "Check the current leaderboard of the FUTO hostel football tournament. See which teams are leading and who's fighting for the championship.",
};

export default function StandingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
