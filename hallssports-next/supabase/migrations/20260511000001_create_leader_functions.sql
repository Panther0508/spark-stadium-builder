-- =============================================================================
-- Create leaderboard RPC functions
-- =============================================================================
-- These functions are called by the /api/standings route via supabase.rpc()
-- =============================================================================

-- Top Goals Scorers
create or replace function get_top_goals_scorers(limit_val int default 10)
returns table (
  id uuid,
  player_name text,
  team text,
  photo_url text,
  goals bigint
)
language plpgsql
security definer
as $$
begin
  return query
  select
    me.player_id as id,
    me.player_name,
    t.name as team,
    p.photo_url,
    count(*) as goals
  from match_events me
  inner join matches m on m.id = me.match_id and m.is_verified = true
  left join teams t on t.id = m.home_team_id
  left join players p on p.id = me.player_id
  where me.type = 'goal'
  group by me.player_id, me.player_name, t.name, p.photo_url
  order by goals desc
  limit limit_val;
end;
$$;

-- Top Assists
create or replace function get_top_assists(limit_val int default 10)
returns table (
  id uuid,
  player_name text,
  team text,
  photo_url text,
  assists bigint
)
language plpgsql
security definer
as $$
begin
  return query
  select
    me.player_id as id,
    me.player_name,
    t.name as team,
    p.photo_url,
    count(*) as assists
  from match_events me
  inner join matches m on m.id = me.match_id and m.is_verified = true
  left join teams t on t.id = m.home_team_id
  left join players p on p.id = me.player_id
  where me.assist is not null
  group by me.player_id, me.player_name, t.name, p.photo_url
  order by assists desc
  limit limit_val;
end;
$$;

-- Top Clean Sheets
create or replace function get_top_clean_sheets(limit_val int default 10)
returns table (
  id uuid,
  team text,
  team_logo text,
  clean_sheets bigint
)
language plpgsql
security definer
as $$
begin
  return query
  select
    t.id,
    t.name as team,
    t.logo_url as team_logo,
    count(*) as clean_sheets
  from matches m
  inner join teams t on (t.id = m.home_team_id or t.id = m.away_team_id)
  where m.is_verified = true
    and m.status = 'finished'
    and (
      (t.id = m.home_team_id and m.away_score = 0) or
      (t.id = m.away_team_id and m.home_score = 0)
    )
  group by t.id, t.name, t.logo_url
  order by clean_sheets desc
  limit limit_val;
end;
$$;

-- Top Corners
create or replace function get_top_corners(limit_val int default 10)
returns table (
  id uuid,
  team text,
  team_logo text,
  corners bigint
)
language plpgsql
security definer
as $$
begin
  return query
  select
    t.id,
    t.name as team,
    t.logo_url as team_logo,
    count(*) as corners
  from match_events me
  inner join matches m on m.id = me.match_id and m.is_verified = true
  inner join teams t on t.id = m.home_team_id
  where me.type in ('corner')
  group by t.id, t.name, t.logo_url
  order by corners desc
  limit limit_val;
end;
$$;

-- Top Cards
create or replace function get_top_cards(limit_val int default 10)
returns table (
  id uuid,
  player_name text,
  team text,
  photo_url text,
  yellow_cards bigint,
  red_cards bigint,
  total_cards bigint
)
language plpgsql
security definer
as $$
begin
  return query
  select
    me.player_id as id,
    me.player_name,
    t.name as team,
    p.photo_url,
    count(*) filter (where me.type = 'yellow') as yellow_cards,
    count(*) filter (where me.type = 'red') as red_cards,
    count(*) as total_cards
  from match_events me
  inner join matches m on m.id = me.match_id and m.is_verified = true
  left join teams t on t.id = m.home_team_id
  left join players p on p.id = me.player_id
  where me.type in ('yellow', 'red')
  group by me.player_id, me.player_name, t.name, p.photo_url
  order by total_cards desc
  limit limit_val;
end;
$$;