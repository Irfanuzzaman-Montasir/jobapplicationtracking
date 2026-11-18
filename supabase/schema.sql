-- ==============================================================================
-- JobTrack Database Schema
-- Supabase PostgreSQL Setup with Multi-User Authentication Support
-- ==============================================================================

-- 1. Create the applications table with user_id
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  company_name text not null,
  position text not null,
  application_date date not null,
  response_received boolean not null default false,
  response_outcome text not null default 'na' check (response_outcome in ('positive', 'negative', 'na')),
  job_type text not null default 'remote' check (job_type in ('remote', 'hybrid', 'onsite')),
  application_source text not null default 'website' check (application_source in ('website', 'linkedin', 'email')),
  comments text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- If table already existed without user_id, add it safely:
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'applications' and column_name = 'user_id'
  ) then
    alter table public.applications 
    add column user_id uuid references auth.users(id) on delete cascade default auth.uid();
  end if;
end $$;

-- 2. Indexes for performant queries
create index if not exists idx_applications_user_date on public.applications (user_id, application_date desc);

-- 3. Enable Row Level Security (RLS)
alter table public.applications enable row level security;

-- 4. Clean up any existing policies
drop policy if exists "Allow anonymous select on applications" on public.applications;
drop policy if exists "Allow anonymous insert on applications" on public.applications;
drop policy if exists "Allow anonymous update on applications" on public.applications;
drop policy if exists "Allow anonymous delete on applications" on public.applications;

drop policy if exists "Users can view own applications" on public.applications;
drop policy if exists "Users can insert own applications" on public.applications;
drop policy if exists "Users can update own applications" on public.applications;
drop policy if exists "Users can delete own applications" on public.applications;

-- 5. Row Level Security Policies: Users can ONLY see and manage their own applications
create policy "Users can view own applications"
  on public.applications
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own applications"
  on public.applications
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own applications"
  on public.applications
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own applications"
  on public.applications
  for delete
  using (auth.uid() = user_id);
