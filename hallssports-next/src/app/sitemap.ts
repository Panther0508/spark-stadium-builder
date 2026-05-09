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
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Static routes
  staticRoutes.forEach((route) => {
    const priority = route === "" ? 1.0 : route === "/matches" ? 0.9 : 0.8;
    const changeFreq: "hourly" | "daily" | "weekly" | "monthly" =
      route === "" || route === "/matches" ? "hourly" : "weekly";
    
    sitemapEntries.push({
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: changeFreq,
      priority,
    });
  });

  // Dynamic routes - matches and players from Supabase
  if (supabase) {
    try {
      // Fetch matches
      const { data: matches } = await supabase
        .from("matches")
        .select("id,updated_at")
        .eq("is_verified", true);
      
      if (matches && matches.length > 0) {
        matches.forEach((match: { id: string; updated_at: string | null }) => {
          sitemapEntries.push({
            url: `${SITE_URL}/match/${match.id}`,
            lastModified: match.updated_at ? new Date(match.updated_at) : new Date(),
            changeFrequency: "hourly",
            priority: 0.85,
          });
        });
      }

      // Fetch players
      const { data: players } = await supabase
        .from("players")
        .select("id,updated_at")
        .eq("is_verified", true);
      
      if (players && players.length > 0) {
        players.forEach((player: { id: string; updated_at: string | null }) => {
          sitemapEntries.push({
            url: `${SITE_URL}/players/${player.id}`,
            lastModified: player.updated_at ? new Date(player.updated_at) : new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
          });
        });
      }
    } catch (error) {
      console.error("Error fetching dynamic routes for sitemap:", error);
    }
  }

  return sitemapEntries;
}