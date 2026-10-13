create extension if not exists pgcrypto;

create type public.campaign_status as enum ('draft','upcoming','active','ended');
create type public.application_status as enum ('pending','approved','rejected');

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  project text not null,
  description text not null,
  campaign_type text not null,
  status public.campaign_status not null default 'draft',
  capacity integer check (capacity is null or capacity > 0),
  starts_at timestamptz,
  ends_at timestamptz,
  reward text,
  requirements jsonb not null default '[]',
  form_config jsonb not null default '{"walletRequired":false}',
  review_rules jsonb not null default '{}',
  retention_days integer not null default 180 check (retention_days between 1 and 730),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  x_username text not null,
  x_username_normalized text generated always as (lower(trim(leading '@' from x_username))) stored,
  x_profile_url text not null,
  post_url_1 text not null,
  post_url_2 text not null,
  wallet_address text,
  status public.application_status not null default 'pending',
  lookup_code_hash text unique not null,
  ip_hash text,
  user_agent_hash text,
  consented_at timestamptz not null,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  review_note text,
  unique (campaign_id, x_username_normalized),
  check (post_url_1 <> post_url_2),
  check (wallet_address is null or wallet_address ~ '^0x[0-9a-fA-F]{40}$')
);

create index applications_campaign_status_idx on public.applications(campaign_id,status);
create index applications_submitted_at_idx on public.applications(submitted_at desc);

alter table public.campaigns enable row level security;
alter table public.applications enable row level security;
alter table public.admin_users enable row level security;

create function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.admin_users where user_id = auth.uid());
$$;

create policy "public reads published campaigns" on public.campaigns for select using (status <> 'draft');
create policy "admins manage campaigns" on public.campaigns for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage applications" on public.applications for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read roles" on public.admin_users for select using (public.is_admin());

insert into public.campaigns (slug,name,project,description,campaign_type,status,reward,requirements,form_config,review_rules)
values ('fungolabs-vietnam-2026','FungoLabs — Community Contributors','FungoLabs','Chương trình nomination dành cho contributor Việt Nam của dự án NFT mã hóa trên Ethereum, xây dựng với FHE của Zama.','Community Nomination','draft','Quyền lợi đang chờ xác nhận chính thức',
  '["Có ít nhất 2 bài đăng gốc về FungoLabs trước 00:00 ngày 13/10/2026 (UTC+7).","Cung cấp 2 liên kết bài đăng X.","Không tính repost, nội dung sao chép hoặc spam.","Mỗi người chỉ tham gia một lần.","Không đánh giá theo follower hoặc tương tác."]',
  '{"walletRequired":false,"fields":["xUsername","xProfileUrl","postUrl1","postUrl2"]}',
  '{"manualReview":true,"prioritizeSubstantiveContributions":true}');

-- Schedule from Supabase Cron or an external trusted job:
-- delete from public.applications a using public.campaigns c
-- where a.campaign_id=c.id and a.submitted_at < now() - make_interval(days=>c.retention_days);
