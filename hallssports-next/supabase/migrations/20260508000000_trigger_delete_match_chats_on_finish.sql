-- Delete chat messages when a match is marked as finished
-- Trigger: after update on matches where status changes to 'finished'

create or replace function public.delete_match_chats_on_finish()
returns trigger as $$
begin
  if NEW.status = 'finished' and OLD.status <> 'finished' then
    delete from public.match_chats where match_id = NEW.id;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if exists (for idempotency)
drop trigger if exists trigger_delete_match_chats on public.matches;

create trigger trigger_delete_match_chats
after update on public.matches
for each row
when (NEW.status = 'finished' and OLD.status <> 'finished')
execute function public.delete_match_chats_on_finish();