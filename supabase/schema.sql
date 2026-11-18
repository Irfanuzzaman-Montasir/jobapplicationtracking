-- ==============================================================================
-- JobTrack Database Schema
-- Supabase PostgreSQL Setup
-- ==============================================================================

-- 1. Create the applications table
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
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

-- 2. Create index on application_date for performant sorting
create index if not exists idx_applications_date on public.applications (application_date desc);

-- 3. Enable Row Level Security (RLS)
alter table public.applications enable row level security;

-- 4. Create RLS Policies to allow standard CRUD for public personal usage
-- (For a personal single-user tracker, allow read/write access via the anon key)
create policy "Allow anonymous select on applications"
  on public.applications
  for select
  using (true);

create policy "Allow anonymous insert on applications"
  on public.applications
  for insert
  with check (true);

create policy "Allow anonymous update on applications"
  on public.applications
  for update
  using (true)
  with check (true);

create policy "Allow anonymous delete on applications"
  on public.applications
  for delete
  using (true);

-- 5. Optional: Insert initial sample data
insert into public.applications (
  company_name,
  position,
  application_date,
  response_received,
  response_outcome,
  job_type,
  application_source,
  comments
) values
  ('Stripe', 'Full Stack Engineer', current_date - 3, true, 'positive', 'remote', 'linkedin', 'Recruiter reached out for initial phone screen on Thursday.'),
  ('Vercel', 'Frontend Engineer', current_date - 6, true, 'positive', 'remote', 'website', 'Take-home assessment submitted.'),
  ('Linear', 'Product Engineer', current_date - 8, false, 'na', 'remote', 'website', 'Applied directly through careers page.'),
  ('Datadog', 'Software Engineer - Infrastructure', current_date - 13, true, 'negative', 'hybrid', 'email', 'Position was filled internally.'),
  ('Figma', 'Software Engineer', current_date - 16, false, 'na', 'onsite', 'linkedin', 'Referred by alumni contact.')
on conflict do nothing;
