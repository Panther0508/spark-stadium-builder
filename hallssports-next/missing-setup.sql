-- =============================================================================
-- HallsSports Additional Database Setup
-- =============================================================================
-- Purpose: Additional schema, triggers, and functions that complement setup.sql
--          Run this AFTER setup.sql has been executed.
-- Instructions: Run this entire script in the Supabase SQL Editor.
-- =============================================================================

-- =============================================================================
-- 1. ADDITIONAL FUNCTIONS
-- =============================================================================

-- Function: get_player_stats(player_id)
-- Returns comprehensive stats for a single player
create or replace function get_player_stats(p_player_id uuid)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'player', (
      select row_to_json(p)::jsonb
      from players p
      where p.id = p_player_id
    ),
    'events', (
      select jsonb_agg(row_to_json(me))::jsonb
      from match_events me
      where me.player_id = p_player_id
      order by me.created_at desc
      limit 50
    ),
    'match_count', (
      select count(distinct me.match_id)
      from match_events me
      where me.player_id = p_player_id
    )
  );
$$;

-- Function: get_match_summary(match_id)
-- Returns full match summary with events, scores, and player highlights
create or replace function get_match_summary(p_match_id uuid)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'match', (
      select row_to_json(m)::jsonb
      from matches m
      where m.id = p_match_id
    ),
    'events', (
      select jsonb_agg(row_to_json(me) order by me.minute asc)::jsonb
      from match_events me
      where me.match_id = p_match_id
    ),
    'home_team', (
      select t.name
      from teams t
      inner join matches m on m.home_team_id = t.id
      where m.id = p_match_id
    ),
    'away_team', (
      select t.name
      from teams t
      inner join matches m on m.away_team_id = t.id
      where m.id = p_match_id
    )
  );
$$;

-- Function: get_league_stats()
-- Returns aggregate league statistics
create or replace function get_league_stats()
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'total_matches', (select count(*) from matches),
    'total_players', (select count(*) from players where is_verified = true),
    'total_goals', (select count(*) from match_events where type = 'goal'),
    'total_teams', (select count(*) from teams),
    'current_tournament', (
      select row_to_json(t)::jsonb
      from tournaments t
      order by t.created_at desc
      limit 1
    ),
    'top_scorer', (
      select jsonb_build_object('player_name', me.player_name, 'goals', me.goal_count)
      from (
        select player_name, count(*) as goal_count
        from match_events
        where type = 'goal'
        group by player_name
        order by goal_count desc
        limit 1
      ) me
    ),
    'matches_today', (
      select count(*)
      from matches
      where date(match_date) = current_date
    )
  );
$$;

-- =============================================================================
-- 2. ADDITIONAL TRIGGERS (including admin_logs enforcement)
-- =============================================================================

-- Trigger: admin action logging for players table
create or replace function log_player_action()
returns trigger as $$
begin
  insert into admin_logs (admin_id, action, table_name, record_id, details)
  values (
    (auth.jwt() ->> 'sub')::uuid,
    tg_op,
    'players',
    case when tg_op = 'DELETE' then OLD.id else NEW.id end,
    jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
  );
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_log_player_actions on players;
create trigger trg_log_player_actions
  after insert or update or delete on players
  for each row execute function log_player_action();

-- Trigger: admin action logging for announcements table
create or replace function log_announcement_action()
returns trigger as $$
begin
  insert into admin_logs (admin_id, action, table_name, record_id, details)
  values (
    (auth.jwt() ->> 'sub')::uuid,
    tg_op,
    'announcements',
    case when tg_op = 'DELETE' then OLD.id else NEW.id end,
    jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
  );
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_log_announcement_actions on announcements;
create trigger trg_log_announcement_actions
  after insert or update or delete on announcements
  for each row execute function log_announcement_action();

-- Trigger: admin action logging for matches table
create or replace function log_match_action()
returns trigger as $$
begin
  insert into admin_logs (admin_id, action, table_name, record_id, details)
  values (
    (auth.jwt() ->> 'sub')::uuid,
    tg_op,
    'matches',
    case when tg_op = 'DELETE' then OLD.id else NEW.id end,
    jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
  );
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_log_match_actions on matches;
create trigger trg_log_match_actions
  after insert or update or delete on matches
  for each row execute function log_match_action();

-- Trigger: admin action logging for highlights table
create or replace function log_highlight_action()
returns trigger as $$
begin
  insert into admin_logs (admin_id, action, table_name, record_id, details)
  values (
    (auth.jwt() ->> 'sub')::uuid,
    tg_op,
    'highlights',
    case when tg_op = 'DELETE' then OLD.id else NEW.id end,
    jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
  );
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_log_highlight_actions on highlights;
create trigger trg_log_highlight_actions
  after insert or update or delete on highlights
  for each row execute function log_highlight_action();

-- Trigger: admin action logging for match_events table
create or replace function log_match_event_action()
returns trigger as $$
begin
  insert into admin_logs (admin_id, action, table_name, record_id, details)
  values (
    (auth.jwt() ->> 'sub')::uuid,
    tg_op,
    'match_events',
    case when tg_op = 'DELETE' then OLD.id else NEW.id end,
    jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
  );
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_log_match_event_actions on match_events;
create trigger trg_log_match_event_actions
  after insert or update or delete on match_events
  for each row execute function log_match_event_action();

-- Trigger: Verify match score consistency on match_events update
create or replace function verify_match_consistency()
returns trigger as $$
declare
  v_match_status text;
begin
  select status into v_match_status from matches where id = NEW.match_id;
  if v_match_status = 'finished' then
    raise exception 'Cannot modify events on a finished match';
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_verify_match_consistency on match_events;
create trigger trg_verify_match_consistency
  before insert or update on match_events
  for each row execute function verify_match_consistency();

-- =============================================================================
-- 3. FEEDBACK TABLE
-- =============================================================================

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

-- Allow anyone to insert feedback
create policy "Anyone can submit feedback" on feedback
  for insert with check (true);

-- Allow admin to view and update
create policy "Admin can view feedback" on feedback
  for select using (true);

create policy "Admin can update feedback" on feedback
  for update using (true);

-- Index for feedback queries
create index if not exists idx_feedback_status on feedback(status);
create index if not exists idx_feedback_created_at on feedback(created_at desc);

-- =============================================================================
-- 4. PLAYER DETAIL VIEW (for player/[id] route)
-- =============================================================================

-- Helper view to get player details with team info
create or replace view player_details as
select
  p.id,
  p.name,
  p.position,
  p.number,
  p.photo_url,
  p.is_verified,
  p.goals,
  p.assists,
  p.yellow_cards,
  p.red_cards,
  p.appearances,
  p.created_at,
  t.id as team_id,
  t.name as team_name,
  t.short_name as team_short_name,
  t.color as team_color,
  t.logo_url as team_logo_url
from players p
left join teams t on p.team_id = t.id;

-- =============================================================================
-- 5. UPDATED RLS POLICIES
-- =============================================================================

-- Drop and recreate feedback RLS
drop policy if exists "Public read feedback" on feedback;
drop policy if exists "Admin read feedback" on feedback;

-- Feedback: public can submit (insert), service_role can read/update
create policy "Public can submit feedback" on feedback
  for insert with check (true);

-- =============================================================================
-- 6. ADDITIONAL INDEXES
-- =============================================================================

create index if not exists idx_match_events_player_name on match_events(player_name);
create index if not exists idx_feedback_type on feedback(type);

-- =============================================================================
-- 7. REALTIME FOR FEEDBACK
-- =============================================================================

alter publication supabase_realtime add table feedback;

-- =============================================================================
-- END OF ADDITIONAL SETUP
-- =============================================================================