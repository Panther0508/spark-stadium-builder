-- Add organizers and contributors settings if they don't exist
-- These are stored as JSON arrays in the settings table

insert into settings (key, value) values
  ('organizers', '[]'),
  ('contributors', '[]')
on conflict (key) do nothing;