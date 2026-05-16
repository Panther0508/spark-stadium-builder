-- Add bio column to players table if it doesn't exist
alter table public.players add column if not exists bio text;
