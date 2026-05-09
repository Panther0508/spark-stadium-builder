-- Create push_subscriptions table for storing WebPush subscriptions
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Optional index on endpoint for quick lookup
create index if not exists push_subscriptions_endpoint_idx on public.push_subscriptions (endpoint);

-- Row Level Security: allow inserts from authenticated or public? For simplicity, allow public inserts.
alter table public.push_subscriptions enable row level security;

create policy "Allow public insert" on public.push_subscriptions
  for insert with check (true);

create policy "Allow public select" on public.push_subscriptions
  for select using (true);

-- Note: In production, you may want to restrict deletes/updates.