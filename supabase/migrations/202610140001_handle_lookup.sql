-- Public handle lookup is served only by an Edge Function; application rows remain protected by RLS.
create index if not exists applications_handle_idx on public.applications(x_username_normalized);

create table if not exists public.application_rate_limits (
  key_hash text primary key,
  window_started_at timestamptz not null default now(),
  requests integer not null default 1
);
alter table public.application_rate_limits enable row level security;
revoke all on public.application_rate_limits from anon, authenticated;
grant all on public.application_rate_limits to service_role;

create or replace function public.consume_application_rate_limit(key_hash text, max_requests integer, window_seconds integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare request_count integer;
begin
  if max_requests < 1 or window_seconds < 1 then return false; end if;
  insert into public.application_rate_limits as limits (key_hash, window_started_at, requests)
  values (key_hash, now(), 1)
  on conflict on constraint application_rate_limits_pkey do update set
    requests = case when limits.window_started_at < now() - make_interval(secs => window_seconds) then 1 else limits.requests + 1 end,
    window_started_at = case when limits.window_started_at < now() - make_interval(secs => window_seconds) then now() else limits.window_started_at end
  returning requests into request_count;
  delete from public.application_rate_limits where window_started_at < now() - interval '1 day';
  return request_count <= max_requests;
end;
$$;
revoke all on function public.consume_application_rate_limit(text,integer,integer) from public, anon, authenticated;
grant execute on function public.consume_application_rate_limit(text,integer,integer) to service_role;
