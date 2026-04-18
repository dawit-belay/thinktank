-- Single statement for `supabase db query -f` (avoids multi-statement prepared statement errors).
-- Expose ideas/votes to Supabase Realtime; grant SELECT for anon Realtime checks.

do $migration$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'ideas'
  ) then
    execute 'alter publication supabase_realtime add table public.ideas';
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'votes'
  ) then
    execute 'alter publication supabase_realtime add table public.votes';
  end if;

  execute 'alter table public.ideas replica identity full';
  execute 'alter table public.votes replica identity full';
  execute 'grant usage on schema public to anon, authenticated';
  execute 'grant select on public.ideas to anon, authenticated';
  execute 'grant select on public.votes to anon, authenticated';
end
$migration$;
