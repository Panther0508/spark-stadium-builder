import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaders",
  description: "Top scorers, assist kings, and card leaders of the FUTO hostel football tournament. See the best individual performers in one place.",
};

export default function LeadersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
