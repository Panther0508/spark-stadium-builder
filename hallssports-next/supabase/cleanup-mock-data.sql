-- =============================================================================
-- HallsSports Mock Data Cleanup
-- =============================================================================
-- Purpose: Delete all mock/test data from live tables before first matchday.
-- Instructions: Run this in the Supabase SQL Editor AFTER teams are seeded.
--
-- WARNING: This permanently deletes all data from the tables listed below.
-- Only run when you are sure you want to wipe match-related data.
--
-- Preserved tables (NOT touched):
--   • teams (your seeded team list)
--   • tournaments (season config)
--   • settings (site configuration including feedback_url)
--   • referrals (if used)
--   • admin_sessions, admin_logs, push_subscriptions (system tables)
-- =============================================================================

-- 1. Match chats (delete first – depends on matches)
delete from match_chats;

-- 2. Match events (goals, cards)
delete from match_events;

-- 3. Highlights (videos/photos – depends on matches)
delete from highlights;

-- 4. Matches (must come after FK children are gone)
delete from matches;

-- 5. Players (may have FK from match_events which is already deleted)
delete from players;

-- 6. Announcements
delete from announcements;

-- 7. Standings (calculated from matches; recalculated after real matches are entered)
delete from standings;

-- 8. Champions (historical winners – optional; keep if you have real history)
-- delete from champions; -- uncomment only if you want to clear champions too

-- =============================================================================
-- Done. All match-related data is now cleared.
--
-- Next steps:
--  1. Enter real players via admin panel or seed SQL.
--  2. Create real matches with verified=true when ready.
--  3. Standings will auto-recalculate when matches become verified and finished.
-- =============================================================================
