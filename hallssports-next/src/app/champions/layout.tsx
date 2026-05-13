import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Champions",
  description: "The Hall of Fame for the FUTO hostel football tournament. Celebrate the winners of previous seasons and current title holders.",
};

export default function ChampionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
