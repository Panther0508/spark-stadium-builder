# OpenGraph Image Placeholder

This file is a placeholder. A real `og-image.png` (1200×630 pixels) must be generated for social media previews.

**Requirements:**
- Dimensions: 1200×630 px
- Background: Dark (#0F0F0F or similar)
- Accent: Green (#00A859)
- Text: "HallsSports – Live Football, Proudly Futoite"
- Include the HallsSports logo (the 🏟️ stadium icon or wordmark)
- Format: PNG (optimized, <200KB)

**How to generate:**
- Use an AI image generator (DALL-E, Midjourney) with the prompt above.
- Or create in Figma/Canva using the brand colors.
- Save as `public/og-image.png`.
- Update `src/app/layout.tsx` metadata `openGraph.images` accordingly.

**Current fallback:** `public/og-image.svg` exists, but most social scrapers prefer PNG. Create the PNG and delete this placeholder.
