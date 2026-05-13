import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Matches",
  description: "View the full schedule and results of the FUTO hostel football tournament. Follow your favourite teams and stay updated on match venues and times.",
};

export default function MatchesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
