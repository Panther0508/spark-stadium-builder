-- Add is_verified column to match_events
alter table match_events add column if not exists is_verified boolean default false;

-- Update existing events to be verified by default
update match_events set is_verified = true;

-- Add order_index to highlights
alter table highlights add column if not exists order_index integer default 0;
