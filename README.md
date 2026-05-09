# HallsSports – Live Football, Proudly Futoite

**HallsSports** is a full‑stack, real‑time tournament management platform built for the FUTO hostel community. Track live matches, view player statistics, engage in community chat, and stay updated with announcements — all wrapped in a stunning glassmorphism UI with a living 3D HallsSymbol.

Whether you're a fan cheering from your hostel room or an admin managing the tournament, HallsSports delivers fast, reliable, and accessible football data at your fingertips.

---

## Key Features

- **Live Scores & Real‑Time Updates** – Matches update instantly via Supabase Realtime with graceful fallback to polling.
- **Comprehensive Admin Suite** – Three distinct roles (Data Scout, Media Manager, Verifier) with granular permissions to manage matches, players, highlights, announcements, and content verification.
- **Community Chat** – Match‑based chat rooms limited to 20 messages to keep conversations focused and performant.
- **Player Statistics** – Auto‑calculated goals, assists, cards, and appearances that update automatically when matches are verified.
- **PWA & Push Notifications** – Installable on mobile, with VAPID push notifications for instant alerts.
- **Offline‑First Experience** – Service worker caches critical pages and API data; an offline banner appears when the network drops.
- **Full Accessibility** – Keyboard navigation, skip‑to‑content, focus traps, visible focus rings, and ARIA live regions for screen readers.
- **Feedback System** – Floating feedback button with Supabase‑backed feedback collection (native) and Google Forms fallback.
- **OG Image Generation** – Dynamic Open Graph images generated at the edge using `@vercel/og`.
- **Health Check Endpoint** – `/api/cron/ping` for uptime monitoring and keep‑alive.
- **Admin Toolkit** – Backup scripts, database metrics, security hardening (XSS sanitization, generic login errors, RLS), and password recovery.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Styling | Tailwind CSS v4, CSS custom properties (glassmorphism theme) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email/Password) |
| Realtime | Supabase Realtime with custom connection manager |
| Storage | Cloudinary for images & videos |
| Notifications | Web Push API (VAPID) via Service Worker |
| 3D Graphics | React Three Fiber, Drei |
| Animations | Framer Motion |
| Icons | Lucide React |
| Metadata | next-pwa, manifest.json, `@vercel/og` |
| Other | PapaParse (CSV), date-fns, Zod validation |

---

## API Routes

| Route | Method | Description | Runtime |
|---|---|---|---|
| `/api/matches` | GET | All verified matches | Serverless |
| `/api/live-score` | GET | Live match scores + events | Serverless |
| `/api/announcements` | GET | Tournament announcements | Serverless |
| `/api/standings` | GET | Standings + leaderboard | Serverless |
| `/api/chat` | GET/POST | Community chat messages | Serverless |
| `/api/players` | GET | All players | Serverless |
| `/api/player/[id]` | GET | Single player by ID | Serverless |
| `/api/highlights` | GET | Match highlights | Serverless |
| `/api/feedback` | POST | Submit feedback | Serverless |
| `/api/cron/ping` | GET | Health check / keep‑alive | Serverless |
| `/api/admin/metrics` | GET | Admin dashboard metrics (key‑protected) | Serverless |
| `/api/og` | GET | Dynamic OG image generation | Edge |

**Total: 12 serverless functions + 1 edge function**

---

## Screenshots

> *Screenshots will be added here before launch*
>
> - Home page with featured match
> - Live match detail with events
> - Community chat
> - Admin dashboard (scout, media, verifier)
> - Player profile
> - Standings & leaders

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (Next.js)                   │
│  Pages: /, /home, /matches, /match/[id], /admin/**         │
│  Components: GlassCard, StatusBadge, BottomNav, etc.      │
│  Hooks: useMatchRealtime, useChatRealtime, usePushNotify   │
├─────────────────────────────────────────────────────────────┤
│                        API Routes                          │
│  /api/matches, /api/live-score, /api/announcements, etc.  │
│  Retry logic, in-memory TTL cache, server‑side Supabase   │
├─────────────────────────────────────────────────────────────┤
│                     Supabase Backend                       │
│  Tables: matches, players, match_events, match_chats,    │
│          announcements, highlights, standings, feedback,  │
│          admin_logs, push_subscriptions                   │
│  RLS + Storage Buckets (images, highlights)               │
│  Realtime Publication (matches, events, chats, feedback) │
│  Views: player_details                                     │
│  Functions: get_player_stats, get_match_summary,          │
│            get_league_stats                                │
├─────────────────────────────────────────────────────────────┤
│                       External Services                    │
│  Cloudinary (media), VAPID Push (browser notifications)  │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Core Tables
- **matches** – Match details (teams, scores, status, venue, featured flag)
- **players** – Player information (name, position, team, stats)
- **match_events** – Goals, cards, substitutions per match
- **match_chats** – Community chat messages per match (20‑message limit)
- **announcements** – Tournament announcements with verification workflow
- **highlights** – Match highlights (images/videos via Cloudinary)
- **standings** – League table (auto‑calculated)
- **champions** – Tournament champions and historical data
- **feedback** – User feedback submissions (name, email, message, rating)
- **admin_logs** – Audit log for all admin actions
- **push_subscriptions** – Web push subscription records

### Views
- **player_details** – Enriched player data with calculated stats

### Helper Functions
- `get_player_stats(player_id)` – Goals, assists, cards, appearances
- `get_match_summary(match_id)` – Comprehensive match summary
- `get_league_stats()` – League‑wide statistics

---

## Setup & Development

### Prerequisites

- Node.js 18+ and npm (or bun)
- Git
- Supabase account (free tier OK)
- Cloudinary account (optional, for image/video uploads)
- VAPID keys for push notifications (generated via `web-push`)

### Local Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hallssports-next.git
   cd hallssports-next
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file at the project root based on `ENV_CHECKLIST.md`. Minimum required:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
   Add Cloudinary and VAPID keys as needed. See `ENV_CHECKLIST.md` for the complete list.

4. **Set up the database**
   - Open your Supabase project dashboard.
   - Go to SQL Editor and paste the contents of `setup.sql`.
   - For incremental features (feedback, views, triggers, indexes), also run `missing-setup.sql`.
   - Run the scripts to create all tables, indexes, policies, triggers, storage buckets, and seed data.

5. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Development Guide

### Key Design Decisions

- **Consolidated API routes**: Deleted `community`, `events`, and `leaders` routes were merged into `chat`, `live-score`, and `standings` respectively to stay within the 12‑function serverless limit.
- **Feedback**: Uses Google Forms fallback in the frontend (`FeedbackModal.tsx`) with `NEXT_PUBLIC_FEEDBACK_FORM_URL` env var; native `/api/feedback` route provides a Supabase‑backed alternative.
- **Admin auth**: `adminRole` is passed via application layer (`supabaseAdmin.ts` uses `SUPABASE_SERVICE_ROLE_KEY`) rather than `current_setting`.
- **Security**: All user inputs are sanitized via DOMPurify (`sanitize.ts`). Generic error messages are returned to prevent information leakage.

### File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # GET + POST chat messages (consolidated)
│   │   ├── cron/ping/route.ts     # Health check endpoint
│   │   ├── feedback/route.ts      # POST feedback
│   │   ├── live-score/route.ts    # Match data + events (consolidated)
│   │   ├── og/route.tsx           # OG image generation (edge runtime)
│   │   ├── player/[id]/route.ts   # Single player lookup
│   │   ├── standings/route.ts     # Standings + leaderboard (consolidated)
│   │   └── ...
│   ├── admin/                     # Admin dashboards (scout, media, verifier)
│   ├── home/                      # Home page
│   ├── layout.tsx                 # Root layout with nav, providers
│   └── page.tsx                   # Redirect to /home
├── components/
│   ├── admin/                     # Admin UI components
│   ├── BottomNav.tsx              # Mobile bottom navigation
│   ├── FeedbackModal.tsx          # Feedback form modal
│   ├── FloatingFeedbackButton.tsx # Floating feedback trigger
│   ├── FeedbackButtonProvider.tsx # Conditional feedback button display
│   ├── PageShell.tsx              # Page wrapper with motion
│   └── ...
├── hooks/
│   ├── useAdminAuth.ts            # Admin authentication hook
│   └── ...
├── lib/
│   ├── queries.ts                 # Supabase query functions + types
│   ├── sanitize.ts                # DOMPurify HTML sanitization
│   ├── retry.ts                   # Exponential backoff retry utility
│   └── supabase.ts / supabaseAdmin.ts
└── ...
```

### Custom Scrollbar

The project includes a custom green scrollbar defined in `src/app/globals.css`:
```css
.custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 4px; }
```
Applied via `className="custom-scrollbar"` on the `<body>` element in `layout.tsx`.

### Feedback System

Two feedback paths exist:
1. **Google Forms** (default) – Configured via `NEXT_PUBLIC_FEEDBACK_FORM_URL` env var. Used by `FeedbackModal.tsx`.
2. **Native Supabase** – New `/api/feedback` POST endpoint with rate limiting and input sanitization. Toggle in `FeedbackModal.tsx` by commenting/uncommenting the form action.

---

## Admin Guide

A complete admin manual is available in `docs/ADMIN_GUIDE.md`. It covers:

- Role‑by‑role responsibilities (Scout, Media, Verifier)
- Creating matches, entering live scores, managing players, importing CSV
- Uploading highlights, updating tournament settings
- Verification queue workflow and manual overrides
- Troubleshooting common issues

---

## Environment Variables

See `docs/ENV_CHECKLIST.md` for the complete list of required and optional environment variables.

---

## Deployment to Vercel

1. Push your code to GitHub.
2. In Vercel, import the repository.
3. Configure all environment variables from `docs/ENV_CHECKLIST.md` in Vercel's dashboard (**Settings → Environment Variables**). Mark secrets (service role, VAPID private, Cloudinary API secret) as **Sensitive**.
4. Deploy! 🚀

**Important:** After first deploy, run the `setup.sql` and `missing-setup.sql` scripts on your production Supabase instance before using the app.

---

## Performance Optimization

- **Dynamic 3D Scene:** The 3D stadium background (`FootballFieldScene`) is SSR-disabled and only loads on dynamic pages (home, matches, live) – static pages skip it entirely.
- **Bundle Analyzer:** Run `npm run analyze` to generate a visual bundle breakdown (`/.next/analyze/client.html`). Useful for spotting heavy dependencies.
- **PWA Caching:** Service worker caches static assets and API responses for offline use.
- **Edge OG Images:** OG image generation runs on Vercel Edge for sub‑100ms response.

---

## Feedback & Bug Reports

We value your input!
- Tap the floating 💡 **Feedback** button (bottom‑right) to open the feedback form.
- Or access **More → Feedback** from the bottom navigation.
- Found a broken link? Visit our [404 page](/) for a quick report.

---

## Contributing

Contributions are welcome! Please open an issue or pull request. For major changes, contact the maintainer first.

---

## Contributors

- **Nmesirionye Ngbaronye** – Lead developer & designer
- Built with ❤️ for the FUTO community

---

## License

MIT License – see the [LICENSE](LICENSE) file for details.

---

## Powered by Pantero

HallsSports is proudly built and maintained by the **Pantero** team.
Check out our other projects: [pantero.vercel.app](https://pantero.vercel.app)

---

> **HallsSports v1.0** – May 2026 