-- Database size and connection metrics functions for /api/admin/metrics

-- get_database_size: returns size in bytes
create or replace function public.get_database_size()
returns bigint
language sql
stable
as $$
  select pg_database_size(current_database());
$$;

-- get_connection_count: returns number of active connections to this database
create or replace function public.get_connection_count()
returns integer
language sql
stable
as $$
  select count(*) from pg_stat_activity where datname = current_database();
$$;