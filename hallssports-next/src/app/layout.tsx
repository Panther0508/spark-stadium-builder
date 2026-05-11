import type { Metadata } from "next";
import { BottomNavWrapper } from "@/components/BottomNavWrapper";
import { ClientLayout } from "@/components/ClientLayout";
import { ToastProvider } from "@/components/ToastProvider";
import { OfflineBanner } from "@/components/OfflineBanner";
import { SkipToContent } from "@/components/SkipToContent";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppleMetaTags } from "@/components/AppleMetaTags";
import SceneController from "@/components/SceneController";
import { FeedbackButtonProvider } from "@/components/FeedbackButtonProvider";
import { Space_Grotesk } from "next/font/google";
import { AdminNavButton } from "@/components/AdminNavButton";
import { AnimatePresence } from "framer-motion";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "HallsSports – Live Football, Proudly Futoite",
    template: "%s | HallsSports",
  },
  description: "Real-time football scores, stats, and community for FUTO hostel competitions. Follow live matches, track players, and join the conversation – proudly Futoite.",
  keywords: ["FUTO football", "hostel competition", "live sports", "HallsSports", "Nigerian university sports", "inter-hostel tournament", "Owerri", "FUTOite"],
  authors: [{ name: "Nmesirionye Ngbaronye", url: "https://github.com/panther0508" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    siteName: "HallsSports",
    title: "HallsSports – Live Football, Proudly Futoite",
    description: "Real-time football scores, stats, and community for FUTO hostel competitions. Follow live matches, track players, and join the conversation – proudly Futoite.",
    url: SITE_URL,
    images: [{ url: `${SITE_URL}/og-image.svg`, width: 1200, height: 630, alt: "HallsSports – Live Football, Proudly Futoite" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HallsSports – Live Football, Proudly Futoite",
    description: "Real-time football scores, stats, and community for FUTO hostel competitions. Follow live matches, track players, and join the conversation – proudly Futoite.",
    images: [`${SITE_URL}/og-image.svg`],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export const viewport = {
  themeColor: "#0F0F0F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "HallsSports",
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.svg`,
  };

  return (
    <html lang="en" className={`${spaceGrotesk.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <script src="https://upload-widget.cloudinary.com/global/all.js" type="text/javascript" defer></script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
         <AppleMetaTags />
         <meta name="google-site-verification" content="google9c4a7634a6ae6735" />
      </head>
      <body className="min-h-full flex flex-col custom-scrollbar">
        <SkipToContent />
        <SceneController />
        <div className="fixed top-4 right-4 z-50">
          <AdminNavButton />
        </div>
        <ThemeProvider>
          <ToastProvider>
            <OfflineBanner />
            <ClientLayout>
              <AnimatePresence mode="wait">
                {children}
              </AnimatePresence>
            </ClientLayout>
          </ToastProvider>
        </ThemeProvider>
        <BottomNavWrapper />
        <FeedbackButtonProvider />
      </body>
    </html>
  );
}