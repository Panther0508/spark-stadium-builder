import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community",
  description: "Join the conversation with other FUTOites. Share your thoughts on matches, cheer for your hostel, and be part of the HallsSports community.",
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
