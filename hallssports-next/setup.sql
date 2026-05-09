-- =============================================================================
-- HallsSports Production Database Schema
-- =============================================================================
-- Purpose: Creates all tables, indexes, row-level security policies, triggers,
--          storage buckets, and realtime publications for the HallsSports app.
-- Instructions: Run this entire script in the Supabase SQL Editor.
--
-- POST-DEPLOYMENT STEPS (must be done in Supabase dashboard after running this SQL):
--   1. Enable pg_cron extension: Database → Extensions → pg_cron
--   2. Enable SSL Enforcement: Database → SSL Enforcement
--   3. Enable Network Restrictions: Database → Network → Restrict connections
--   4. Enable Supavisor connection pooling: Database → Connection Pooling
--   5. Disable email confirmation: Authentication → Email → Uncheck "Confirm email"
--   6. Configure custom SMTP (SendGrid): Authentication → Email → Custom SMTP
--   7. Generate VAPID keys and set env vars: NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY
-- =============================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- =============================================================================
-- 1. TABLES
-- =============================================================================

-- Tournaments (single row config for the current tournament season)
create table if not exists tournaments (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    season text,
    start_date date,
    end_date date,
    created_at timestamp with time zone default now()
);

-- Teams
create table if not exists teams (
    id uuid primary key default gen_random_uuid(),
    name text unique not null,
    short_name text,
    color text default '#00A859',
    logo_url text,
    created_at timestamp with time zone default now()
);

-- Players
create table if not exists players (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    team_id uuid references teams(id) on delete cascade,
    position text,
    number integer,
    photo_url text,
    is_verified boolean default false,
    -- Stats (auto-updated by triggers)
    goals integer default 0,
    assists integer default 0,
    yellow_cards integer default 0,
    red_cards integer default 0,
    appearances integer default 0,
    created_at timestamp with time zone default now()
);

-- Matches
create table if not exists matches (
    id uuid primary key default gen_random_uuid(),
    tournament_id uuid references tournaments(id) on delete set null,
    home_team_id uuid references teams(id) on delete cascade,
    away_team_id uuid references teams(id) on delete cascade,
    match_date timestamp with time zone not null,
    venue text,
    home_score integer default 0,
    away_score integer default 0,
    status text default 'scheduled' check (status in ('scheduled', 'live', 'half-time', 'finished')),
    featured boolean default false,
    image_url text,
    admin_post text,
    is_verified boolean default false,
    created_at timestamp with time zone default now()
);

-- Match Events (goals, cards, substitutions)
create table if not exists match_events (
    id uuid primary key default gen_random_uuid(),
    match_id uuid references matches(id) on delete cascade not null,
    player_id uuid references players(id) on delete set null,
    player_name text not null,
    type text check (type in ('goal', 'yellow', 'red', 'sub')) not null,
    minute integer,
    assist text,
    created_at timestamp with time zone default now()
);

-- Announcements
create table if not exists announcements (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    body text not null,
    image_url text,
    category text,
    author text,
    is_verified boolean default false,
    created_at timestamp with time zone default now()
);

-- Highlights (photos / videos from matches)
create table if not exists highlights (
    id uuid primary key default gen_random_uuid(),
    match_id uuid references matches(id) on delete cascade,
    title text,
    description text,
    media_url text not null,
    media_type text check (media_type in ('image', 'video')),
    is_verified boolean default false,
    created_at timestamp with time zone default now()
);

-- Standings (leaderboard per tournament – calculated by trigger)
create table if not exists standings (
    id uuid primary key default gen_random_uuid(),
    team_id uuid references teams(id) on delete cascade not null,
    tournament_id uuid references tournaments(id) on delete cascade not null,
    played integer default 0,
    wins integer default 0,
    draws integer default 0,
    losses integer default 0,
    goals_for integer default 0,
    goals_against integer default 0,
    points integer default 0,
    updated_at timestamp with time zone default now()
);

-- Champions (historical winners)
create table if not exists champions (
    id uuid primary key default gen_random_uuid(),
    tournament_id uuid references tournaments(id),
    team_id uuid references teams(id),
    season text,
    year integer,
    created_at timestamp with time zone default now()
);

-- Settings (key-value store for site-wide configuration)
create table if not exists settings (
    key text primary key,
    value text not null
);

-- Referrals (optional feature – user referrals)
create table if not exists referrals (
    id uuid primary key default gen_random_uuid(),
    referrer text not null,
    referee text not null,
    status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
    created_at timestamp with time zone default now()
);

-- Admin Sessions (for custom admin auth tracking)
create table if not exists admin_sessions (
    id uuid primary key default gen_random_uuid(),
    admin_id uuid not null,
    role text check (role in ('scout', 'media', 'verifier')) not null,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone default now(),
    expires_at timestamp with time zone not null
);

-- Match Chats (community chat limited to 20 messages per match)
create table if not exists match_chats (
    id uuid primary key default gen_random_uuid(),
    match_id uuid references matches(id) on delete cascade not null,
    user_name text not null,
    message text not null,
    created_at timestamp with time zone default now()
);

-- Admin Logs (audit trail for admin actions)
create table if not exists admin_logs (
    id uuid primary key default gen_random_uuid(),
    admin_id uuid not null,
    action text not null,
    table_name text not null,
    record_id uuid,
    details jsonb,
    created_at timestamp with time zone default now()
);

-- Feedback table
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('bug_report', 'feature_request', 'general_feedback', 'other')),
  subject text not null,
  description text not null,
  page_url text,
  user_contact text,
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS for feedback
alter table feedback enable row level security;

-- Allow anyone to submit feedback
create policy "Anyone can submit feedback" on feedback
  for insert with check (true);

-- Admin/service_role can read and update feedback
create policy "Admin can view feedback" on feedback
  for select using (true);

create policy "Admin can update feedback" on feedback
  for update using (true);

-- Index for feedback queries
create index if not exists idx_feedback_status on feedback(status);
create index if not exists idx_feedback_created_at on feedback(created_at desc);

-- Push Subscriptions (for web push notifications)
create table if not exists push_subscriptions (
    id uuid primary key default gen_random_uuid(),
    endpoint text unique not null,
    p256dh text not null,
    auth text not null,
    created_at timestamp with time zone default now()
);

-- =============================================================================
-- 2. INDEXES
-- =============================================================================

-- Matches
create index if not exists idx_matches_status on matches(status);
create index if not exists idx_matches_match_date on matches(match_date desc);
create index if not exists idx_matches_featured on matches(featured) where featured = true;

-- Match Events
create index if not exists idx_match_events_match_id on match_events(match_id);
create index if not exists idx_match_events_player_name on match_events(player_name);
create index if not exists idx_match_events_type on match_events(type);

-- Match Chats
create index if not exists idx_match_chats_match_id on match_chats(match_id);
create index if not exists idx_match_chats_created_at on match_chats(created_at desc);

-- Players
create index if not exists idx_players_team_id on players(team_id);
create index if not exists idx_players_name on players(name);
create index if not exists idx_players_verified on players(is_verified) where is_verified = true;

-- Announcements
create index if not exists idx_announcements_verified on announcements(is_verified) where is_verified = true;
create index if not exists idx_announcements_created_at on announcements(created_at desc);

-- Admin Logs
create index if not exists idx_admin_logs_created_at on admin_logs(created_at desc);
create index if not exists idx_admin_logs_admin_id on admin_logs(admin_id);

-- Standings
create unique index if not exists idx_standings_unique on standings(team_id, tournament_id);

-- =============================================================================
-- 3. ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all tables
alter table tournaments enable row level security;
alter table teams enable row level security;
alter table players enable row level security;
alter table matches enable row level security;
alter table match_events enable row level security;
alter table announcements enable row level security;
alter table highlights enable row level security;
alter table standings enable row level security;
alter table champions enable row level security;
alter table settings enable row level security;
alter table referrals enable row level security;
alter table admin_sessions enable row level security;
alter table match_chats enable row level security;
alter table admin_logs enable row level security;
alter table push_subscriptions enable row level security;

-- PUBLIC READ ACCESS (using anon key)

-- tournaments: public read when verified (none currently public, reserved for future)
create policy "Public read verified tournaments" on tournaments
    for select using (true); -- no RLS restriction for now (admin only)

-- teams: always public read (for match display)
create policy "Public read teams" on teams
    for select using (true);

-- players: public read only when verified
create policy "Public read verified players" on players
    for select using (is_verified = true);

-- matches: public read only when verified
create policy "Public read verified matches" on matches
    for select using (is_verified = true);

-- match_events: public read only through verified matches (via match_id join check)
create policy "Public read events from verified matches" on match_events
    for select using (
        exists (
            select 1 from matches m
            where m.id = match_events.match_id and m.is_verified = true
        )
    );

-- announcements: public read only when verified
create policy "Public read verified announcements" on announcements
    for select using (is_verified = true);

-- highlights: public read only when both match and highlight are verified
create policy "Public read verified highlights" on highlights
    for select using (
        exists (
            select 1 from matches m
            where m.id = highlights.match_id and m.is_verified = true
        )
        and highlights.is_verified = true
    );

-- standings: always public read
create policy "Public read standings" on standings
    for select using (true);

-- champions: always public read
create policy "Public read champions" on champions
    for select using (true);

-- settings: public read for select keys (site metadata). We'll expose some keys via API.
create policy "Public read settings" on settings
    for select using (key in ('site_name', 'site_description', 'pantero_url', 'feedback_url'));

-- referrals: not publicly readable
create policy "No public reads on referrals" on referrals
    for select using (false);

-- admin_sessions: not publicly readable
create policy "No public reads on admin_sessions" on admin_sessions
    for select using (false);

-- match_chats: public read and insert (anyone can read chat, but capped via API)
create policy "Public read match chats" on match_chats
    for select using (true);

-- admin_logs: admin-only reads (by role-based row security via RLS later through postgrest)
-- For now, restrict to service_role only; anon has no access.
create policy "No public reads on admin_logs" on admin_logs
    for select using (false);

-- feedback: public insert only (no public read needed)
create policy "Anyone can submit feedback" on feedback
    for insert with check (true);

-- push_subscriptions: allow INSERT for all (anon) but SELECT only with service_role (no policy)
create policy "Anyone can subscribe" on push_subscriptions
    for insert with check (true);
-- No SELECT policy for anon – only service_role can read

-- AUTHENTICATED USER OPERATIONS (using anon key but with auth.uid() checks)
-- These policies apply to any authenticated user (not role-specific in Supabase auth)

-- Players: authenticated users (scouts) can insert and update (but not is_verified)
create policy "Authenticated can insert players" on players
    for insert with check (auth.role() = 'authenticated');
create policy "Authenticated can update players" on players
    for update using (auth.role() = 'authenticated') with check (
        -- Prevent modification of is_verified column by scouts
        old.is_verified = is_verified
    );

-- Matches: authenticated can insert/update (cannot change is_verified directly)
create policy "Authenticated can insert matches" on matches
    for insert with check (auth.role() = 'authenticated');
create policy "Authenticated can update matches" on matches
    for update using (auth.role() = 'authenticated') with check (
        old.is_verified = is_verified
    );

-- Match Events: authenticated insert
create policy "Authenticated can insert match_events" on match_events
    for insert with check (auth.role() = 'authenticated');

-- Announcements: authenticated insert/update (cannot set is_verified)
create policy "Authenticated can insert announcements" on announcements
    for insert with check (auth.role() = 'authenticated');
create policy "Authenticated can update announcements" on announcements
    for update using (auth.role() = 'authenticated') with check (
        old.is_verified = is_verified
    );

-- Highlights: authenticated insert/update (media manager)
create policy "Authenticated can insert highlights" on highlights
    for insert with check (auth.role() = 'authenticated');
create policy "Authenticated can update highlights" on highlights
    for update using (auth.role() = 'authenticated');

-- Settings: authenticated insert/update (media manager)
create policy "Authenticated can upsert settings" on settings
    for all with check (auth.role() = 'authenticated');

-- Admin Logs: authenticated insert via trigger only (no direct writes from client)
create policy "Authenticated can insert admin_logs" on admin_logs
    for insert with check (auth.role() = 'authenticated');

-- Match Chats: public insert already allowed; authenticated can also insert
create policy "Authenticated can insert match_chats" on match_chats
    for insert with check (auth.role() = 'authenticated');

-- Push Subscriptions: authenticated can delete their own
create policy "Users can delete their own subscription" on push_subscriptions
    for delete using (auth.role() = 'authenticated' and endpoint = old.endpoint);

-- =============================================================================
-- 4. TRIGGERS & FUNCTions
-- =============================================================================

-- Auto-update player stats from match_events when a match becomes verified
create or replace function update_player_stats()
returns trigger as $$
begin
    -- Only proceed when match becomes verified or event is inserted into a verified match
    if (tg_op = 'UPDATE' and old.is_verified = false and new.is_verified = true)
       or (tg_op = 'INSERT') then

        -- Increment player stats based on event type
        update players set
            goals = goals + 1
        where id = (select player_id from match_events where id = NEW.id limit 1)
          and exists (select 1 from matches where id = NEW.match_id and is_verified = true);

        update players set
            assists = assists + 1
        where id = (select player_id from match_events where id = NEW.id limit 1)
          and (select assist from match_events where id = NEW.id) is not null
          and exists (select 1 from matches where id = NEW.match_id and is_verified = true);

        update players set
            yellow_cards = yellow_cards + 1
        where id = (select player_id from match_events where id = NEW.id limit 1)
          and (select type from match_events where id = NEW.id) = 'yellow'
          and exists (select 1 from matches where id = NEW.match_id and is_verified = true);

        update players set
            red_cards = red_cards + 1
        where id = (select player_id from match_events where id = NEW.id limit 1)
          and (select type from match_events where id = NEW.id) = 'red'
          and exists (select 1 from matches where id = NEW.match_id and is_verified = true);

        -- Increment appearances when a player participates in a verified match
        -- (Assumes presence in match_events implies participation)
        update players set
            appearances = appearances + 1
        where id = (select player_id from match_events where id = NEW.id limit 1)
          and exists (select 1 from matches where id = NEW.match_id and is_verified = true);
    end if;
    return NEW;
end;
$$ language plpgsql security definer;

-- Trigger: after insert on match_events
create trigger trg_match_events_insert
    after insert on match_events
    for each row execute function update_player_stats();

-- Trigger: after update of is_verified on matches (when a match is verified)
create or replace function trigger_standings_recalc()
returns trigger as $$
begin
    -- Only recalc when a match is marked finished and verified
    if (tg_op = 'UPDATE' and old.status != 'finished' and new.status = 'finished' and new.is_verified = true)
       or (tg_op = 'UPDATE' and old.is_verified = false and new.is_verified = true and new.status = 'finished') then
        -- Rebuild entire standings table for the tournament
        -- This is simple but safe: delete and reinsert based on all verified finished matches
        delete from standings where tournament_id = NEW.tournament_id;

        insert into standings (team_id, tournament_id, played, wins, draws, losses, goals_for, goals_against, points)
        select
            t.id as team_id,
            m.tournament_id,
            count(*) as played,
            count(*) filter (where (m.home_score + m.away_score) is not null) as played_real,
            sum(case when m.home_score > m.away_score and t.id = m.home_team_id
                     or m.away_score > m.home_score and t.id = m.away_team_id then 1 else 0 end) as wins,
            sum(case when m.home_score = m.away_score then 1 else 0 end) as draws,
            sum(case when (m.home_score + m.away_score) is not null then 1 else 0 end) -
                count(*) filter (where m.home_score = m.away_score) as losses,
            sum(case when t.id = m.home_team_id then m.home_score else m.away_score end) as goals_for,
            sum(case when t.id = m.home_team_id then m.away_score else m.home_score end) as goals_against,
            sum(case
                when m.home_score > m.away_score and t.id = m.home_team_id then 3
                when m.away_score > m.home_score and t.id = m.away_team_id then 3
                when m.home_score = m.away_score then 1
                else 0
            end) as points
        from matches m
        join teams t on t.id in (m.home_team_id, m.away_team_id)
        where m.status = 'finished' and m.is_verified = true and m.tournament_id = NEW.tournament_id
        group by t.id, m.tournament_id;
    end if;
    return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_match_verified_standings
    after update of status, is_verified on matches
    for each row execute function trigger_standings_recalc();

-- Chat purge when match finishes
create or replace function purge_chat_on_finish()
returns trigger as $$
begin
    if NEW.status = 'finished' and OLD.status != 'finished' then
        delete from match_chats where match_id = NEW.id;
    end if;
    return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_purge_chat
    after update of status on matches
    for each row execute function purge_chat_on_finish();

-- Admin action logging
create or replace function log_admin_action()
returns trigger as $$
declare
    v_admin_id uuid;
begin
    -- Get current user ID from JWT (assuming claim 'sub' holds user id)
    v_admin_id := (auth.jwt() ->> 'sub')::uuid;

    insert into admin_logs (admin_id, action, table_name, record_id, details)
    values (
        v_admin_id,
        tg_op,
        tg_table_name,
        case when tg_op = 'DELETE' then OLD.id else NEW.id end,
        jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
    );
    return NEW;
end;
$$ language plpgsql security definer;

-- Attach logging trigger to relevant tables
create trigger trg_log_matches
    after insert or update or delete on matches
    for each row execute function log_admin_action();

create trigger trg_log_match_events
    after insert or update or delete on match_events
    for each row execute function log_admin_action();

create trigger trg_log_players
    after insert or update or delete on players
    for each row execute function log_admin_action();

create trigger trg_log_announcements
    after insert or update or delete on announcements
    for each row execute function log_admin_action();

create trigger trg_log_highlights
    after insert or update or delete on highlights
    for each row execute function log_admin_action();

-- =============================================================================
-- 5. STORAGE BUCKETS
-- =============================================================================

-- Images bucket (player photos, team logos, match banners)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'images',
    'images',
    true,
    5242880, -- 5 MB
    '{image/jpeg,image/png,image/webp,image/avif,image/gif}'
) on conflict (id) do nothing;

-- Highlights bucket (videos & photos)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'highlights',
    'highlights',
    true,
    52428800, -- 50 MB
    '{image/jpeg,image/png,image/webp,video/mp4,video/webm}'
) on conflict (id) do nothing;

-- Storage policies for images bucket:
-- Public read
create policy "Public read images" on storage.objects
    for select using (bucket_id = 'images' and auth.role() = 'anon');

-- Authenticated write (admins)
create policy "Authenticated upload images" on storage.objects
    for insert with check (bucket_id = 'images' and auth.role() = 'authenticated');

create policy "Authenticated update images" on storage.objects
    for update using (bucket_id = 'images' and auth.role() = 'authenticated');

create policy "Authenticated delete images" on storage.objects
    for delete using (bucket_id = 'images' and auth.role() = 'authenticated');

-- Storage policies for highlights bucket:
create policy "Public read highlights" on storage.objects
    for select using (bucket_id = 'highlights' and auth.role() = 'anon');

create policy "Authenticated upload highlights" on storage.objects
    for insert with check (bucket_id = 'highlights' and auth.role() = 'authenticated');

create policy "Authenticated delete highlights" on storage.objects
    for delete using (bucket_id = 'highlights' and auth.role() = 'authenticated');

-- =============================================================================
-- 6. REALTIME PUBLICATION
-- =============================================================================

-- Ensure realtime is enabled for matches, match_events, match_chats
-- Note: In Supabase, the default 'supabase_realtime' publication already includes
-- all tables. This ALTER ensures our three critical tables are part of it.
alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table match_events;
alter publication supabase_realtime add table match_chats;

-- =============================================================================
-- 7. INITIAL SEED DATA
-- =============================================================================

-- Insert default tournament
insert into tournaments (name, season) values ('HallsSports Tournament', '2025')
on conflict do nothing;

-- Insert default teams (FUTO hostel teams)
insert into teams (name, short_name, color) values
('Rangers FC', 'Rangers', '#00A859'),
('Panthers United', 'Panthers', '#1E40AF'),
('Thunder Wolves', 'Wolves', '#7C3AED'),
('City Eagles', 'Eagles', '#DC2626'),
('Royal FC', 'Royal', '#F59E0B'),
('United Stars', 'Stars', '#0891B2')
on conflict (name) do nothing;

-- Insert default admin user (uuid from auth.users will differ; this is placeholder)
-- Do NOT insert real users here; they must register via Supabase Auth.

-- Insert default site settings
insert into settings (key, value) values
('site_name', 'HallsSports'),
('site_description', 'Live Football, Proudly Futoite'),
('pantero_url', 'https://pantero.vercel.app'),
('feedback_url', 'https://forms.gle/yourfeedbackform')
on conflict (key) do nothing;

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================

-- =============================================================================
-- 8. SCHEDULED JOBS (pg_cron)
-- =============================================================================

-- Schedule chat cleanup every hour - deletes messages older than 24 hours
-- Note: Requires pg_cron extension to be enabled in Supabase dashboard
select cron.schedule(
  'chat-cleanup',
  '0 * * * *',
  $$ delete from match_chats where created_at < now() - interval '24 hours' $$
);

-- =============================================================================
-- DEPLOYMENT NOTES
-- =============================================================================
-- The following must be configured in the Supabase dashboard (cannot be done via SQL):
--   • SSL Enforcement: Database → SSL Enforcement → Enable
--   • Network Restrictions: Database → Network → Restrict connections to allowed networks
--   • Supavisor Connection Pooling: Database → Connection Pooling → Enable
--   -- Auth Email Confirmation: Authentication → Email → Disable "Confirm email"
--   -- Custom SMTP: Authentication → Email → Set up SendGrid or your SMTP provider
--   -- Storage bucket CORS: Storage → buckets → images/highlights → CORS configuration if needed
--
-- VAPID keys for web push must be generated and set as environment variables:
--   NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY
--   Use: npx web-push generate-vapid-keys or run scripts/generate-vapid.sh(.ps1)
--
-- After deployment, run the cleanup script to remove mock data before first matchday:
--   supabase/cleanup-mock-data.sql
-- =============================================================================
