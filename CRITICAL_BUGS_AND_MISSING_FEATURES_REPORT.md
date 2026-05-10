# HallsSports Critical Bugs & Missing Features Report

## Verified Bugs (present)
- Bug 1: **More drawer does not scroll** – `src/components/MoreDrawer.tsx` – Uses a fixed `h-[70vh]` instead of `max-h`, which may prevent scrolling on some viewports or cut off content.
- Bug 2: **Duplicate chat/community icon** – `src/app/layout.tsx` – Both `FloatingFeedback` and `FloatingFeedbackButton` are active, resulting in two floating buttons with the same icon.
- Bug 3: **Referral page 400 error** – `src/app/referral/page.tsx` – Queries a `referrals` table that likely does not exist in the database or lacks RLS permissions.
- Bug 4: **Feedback form hardcoded URL** – `src/components/FeedbackModal.tsx`, `not-found.tsx`, etc. – Multiple files contain the hardcoded fallback `forms.gle/yourfeedbackform`.
- Bug 5: **Admin navigation not separated** – `src/app/layout.tsx` – `BottomNav` and `AdminNavButton` are rendered globally, causing them to appear on admin pages where they conflict with the `AdminLayout`.
- Bug 6: **Admin pages missing fields/logic** – `scout/matches` misses `image_url` input; `scout/live` has no minute counter or quick action logic.
- Bug 7: **Media Manager lacks uploads** – `admin/scout/players`, `admin/media/highlights` – All image fields rely on text inputs for URLs instead of Cloudinary upload widgets.
- Bug 8: **Public Player Profiles use mock data** – `src/app/players/[id]/page.tsx` – Entirely uses `MOCK_PLAYERS` constant instead of fetching from Supabase.
- Bug 9: **Light theme 3D background** – `src/components/FootballFieldScene.tsx` – Hardcoded dark fog and background colors, making the pitch look broken in light mode.
- Bug 10: **Missing JSON-LD & SEO** – `match/[id]` and `players/[id]` – Missing structured data and dynamic metadata for players.

## Missing Features
- Feature 1: **Cloudinary Integration** – No upload widgets for team logos, player photos, or match covers.
- Feature 2: **Real Admin Dashboard** – `/developer` page and some admin dashboards still use significant amounts of mock data.
- Feature 3: **Manual Override** – Verifier "Manual Override" page is not fully implemented for editing verified records.
- Feature 4: **Bulk Operations** – Verifier queue lacks "Approve All" and "Reject All" functionality (partially implemented in verifier dashboard but not in queue).

## SEO / PWA Status
- sitemap.ts: ✅ present
- robots.ts: ✅ present
- Metadata: ❌ Missing dynamic metadata for players.
- manifest.json: ⚠️ Present but missing icons (only favicon and one placeholder maskable).
- Icons: ❌ Only `favicon.png` exists; 192/512 PNGs are missing.
- Service worker: ✅ Registered via `next-pwa`.

## Admin CRUD Status
| Page | Fetches Real Data? | Can Create/Edit/Delete? |
|------|-------------------|--------------------------|
| scout/matches | yes | yes (misses image_url) |
| scout/live | yes | partial (score only) |
| scout/players | yes | yes (misses photo upload) |
| scout/announcements | yes | yes |
| media/highlights | yes | yes (misses upload) |
| media/settings | yes | yes |
| verifier/queue | yes | yes |
| verifier/override | no | no |

## Console Errors (verified)
- `PlayerProfilePage`: `useParams()` used without proper type safety in some places; relies on mock data.
- `ReferralPage`: 400 Bad Request on `referrals` table fetch.
- `AdminModal`: Potential hydration mismatch if `document.body` is accessed during SSR (partially guarded).

## Summary
- Total critical bugs found: 10
- Missing features: 4
