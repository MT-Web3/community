-- Existing draft rows are preserved; every new or updated campaign requires a start.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'campaigns_start_required' and conrelid = 'public.campaigns'::regclass) then
    alter table public.campaigns add constraint campaigns_start_required check (starts_at is not null) not valid;
  end if;
end;
$$;
