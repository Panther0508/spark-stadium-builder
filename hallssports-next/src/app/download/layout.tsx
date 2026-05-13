import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download App",
  description: "Install HallsSports on your device for the best experience. Get real-time notifications and offline access to match scores.",
};

export default function DownloadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
