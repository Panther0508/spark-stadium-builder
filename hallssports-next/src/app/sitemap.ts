import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const staticRoutes = [
  "",
  "/matches",
  "/standings",
  "/players",
  "/leaders",
  "/champions",
  "/community",
  "/announcements",
  "/highlights",
  "/about",
  "/download",
  "/referral",
  "/settings",
  "/terms",
  "/privacy",
  "/more",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Static routes
  staticRoutes.forEach((route) => {
    sitemapEntries.push({
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" || route === "/matches" ? "hourly" : "weekly",
      priority: route === "" ? 1.0 : route === "/matches" ? 0.9 : 0.8,
    });
  });

  // Dynamic routes
  try {
    if (supabase) {
      const [matchesResult, playersResult] = await Promise.all([
        supabase.from("matches").select("id, match_date").eq("is_verified", true),
        supabase.from("players").select("id, created_at").eq("is_verified", true),
      ]);

      if (matchesResult.data) {
        matchesResult.data.forEach((match) => {
          sitemapEntries.push({
            url: `${SITE_URL}/match/${match.id}`,
            lastModified: new Date(match.match_date),
            changeFrequency: "hourly",
            priority: 0.8,
          });
        });
      }

      if (playersResult.data) {
        playersResult.data.forEach((player) => {
          sitemapEntries.push({
            url: `${SITE_URL}/players/${player.id}`,
            lastModified: new Date(player.created_at),
            changeFrequency: "weekly",
            priority: 0.6,
          });
        });
      }
    }
  } catch (error) {
    console.error("Sitemap dynamic fetch error:", error);
  }

  return sitemapEntries;
}
