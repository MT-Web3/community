create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "public reads site settings" on public.site_settings;
create policy "public reads site settings" on public.site_settings for select using (true);

drop policy if exists "admins manage site settings" on public.site_settings;
create policy "admins manage site settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

insert into public.site_settings (key, value)
values ('menu_visibility', '{"campaigns":true,"about":true,"story":true,"admin":false}'::jsonb)
on conflict (key) do nothing;
