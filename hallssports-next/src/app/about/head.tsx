import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "About – HallsSports Tournament",
  description: "Learn about the HallsSports Tournament, our mission, vision, honoured guests, and contributors. Proudly powered by Pantero for FUTO hostel football competitions.",
  openGraph: {
    title: "About – HallsSports Tournament",
    description: "Learn about the HallsSports Tournament, our mission, vision, honoured guests, and contributors. Proudly powered by Pantero for FUTO hostel football competitions.",
    url: `${SITE_URL}/about`,
  },
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
};