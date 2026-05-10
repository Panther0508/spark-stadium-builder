import type { NextConfig } from "next";
import withPWA from "next-pwa";
import withBundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' https://res.cloudinary.com https://*.supabase.co data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-src 'self' https://www.youtube-nocookie.com;",
          },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

const pwaOptions = {
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  swSrc: "./service-worker.js",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /^https?:\/\/.*\/_next\/static\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "next-static",
        expiration: { maxEntries: 100, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|bmp|avif)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\/api\/(standings|players|leaders|champions)/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-data",
        networkTimeoutSeconds: 3,
        expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      urlPattern: /\/api\/(live-score|events|chat)/i,
      handler: "NetworkOnly",
      options: { cacheName: "api-live" },
    },
    {
      urlPattern: /\/api\/(community|chat)/i,
      handler: "NetworkOnly",
      options: { cacheName: "api-community" },
    },
    {
      urlPattern: /\/api\/(feedback|cron\/ping|admin\/metrics)/i,
      handler: "NetworkOnly",
      options: { cacheName: "api-other" },
    },
    {
      urlPattern: /\/api\/announcements/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "api-announcements",
        expiration: { maxEntries: 10, maxAgeSeconds: 10 * 60 },
      },
    },
  ],
};

export default withSentryConfig(
  withBundleAnalyzer({
    enabled: process.env.ANALYZE === "true",
  })(
    withPWA(pwaOptions)(nextConfig)
  ),
  {
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    widenClientFileUpload: true,
  }
);
