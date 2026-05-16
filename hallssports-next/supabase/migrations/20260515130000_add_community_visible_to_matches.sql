-- Add community_visible column to matches table if it doesn't exist
alter table public.matches add column if not exists community_visible boolean default false;
