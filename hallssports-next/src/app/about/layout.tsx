import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about the HallsSports Tournament, our mission, vision, and the team behind the platform. Proudly Futoite football engagement.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
