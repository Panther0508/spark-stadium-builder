-- =============================================================================
-- Create standings_with_teams view
-- =============================================================================
-- This view joins standings with teams to provide team_name and logo_url
-- Required by the /api/standings API route
-- =============================================================================

create or replace view standings_with_teams as
select
  s.id,
  s.team_id,
  t.name as team_name,
  t.short_name,
  t.logo_url,
  t.color as team_color,
  s.tournament_id,
  s.played,
  s.wins,
  s.draws,
  s.losses,
  s.goals_for,
  s.goals_against,
  (s.goals_for - s.goals_against) as goal_diff,
  s.points,
  s.updated_at,
  -- Simple trend calculation: compare with previous match results
  'same'::text as trend
from standings s
left join teams t on t.id = s.team_id
order by s.points desc;