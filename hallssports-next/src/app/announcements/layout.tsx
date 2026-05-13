import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Announcements",
  description: "Get the latest news, updates, and official statements regarding the FUTO hostel football tournament.",
};

export default function AnnouncementsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
