import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "More",
  description: "Explore additional features and links for HallsSports.",
};

export default function MoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
