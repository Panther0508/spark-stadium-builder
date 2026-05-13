import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Customise your HallsSports experience. Manage notifications, appearance, and chat preferences.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
