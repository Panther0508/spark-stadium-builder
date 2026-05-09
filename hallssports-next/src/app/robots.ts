import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
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
        ],
        disallow: [
          "/admin",
          "/admin-login",
          "/admin/*",
          "/developer",
          "/api",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}