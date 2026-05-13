import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Highlights",
  description: "Relive the best moments of the FUTO hostel football tournament with photos and videos of goals, saves, and match action.",
};

export default function HighlightsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
