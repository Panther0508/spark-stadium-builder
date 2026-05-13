import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Referral",
  description: "Invite your friends to join HallsSports and earn rewards while supporting your hostel team.",
};

export default function ReferralLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
