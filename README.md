# JobTrack - Personal Job Application Tracker

A clean, minimal, responsive personal job application tracking web app built with Next.js, TypeScript, Tailwind CSS, and Supabase PostgreSQL with **Username & Password Authentication**.

---

## Features

- **Username & Password Authentication**:
  - Pure username and password credentials (no email prompt, no email verification).
  - Each user has their own private dashboard and application list.
  - Row Level Security (RLS) ensures users can never see each other's data.
- **Dashboard Statistics**: Dynamic metrics computed specifically from the authenticated user's data:
  - Total Applications
  - Responded
  - No Response
  - Positive Responses
- **Full CRUD Management**:
  - Add new job applications with modal dialog and real-time input validation.
  - Edit existing applications with pre-populated fields.
  - Delete applications with safety confirmation modal.
- **Search & Filters**:
  - Real-time search by company name or position.
  - Filter by response status (Responded, No Response).
  - Filter by job type (Remote, Hybrid, On-site).
  - Filter by application source (Website, LinkedIn, Email).
  - Sort by application date (Ascending / Descending).
- **CSV Export**: One-click export of filtered applications to formatted CSV.
- **Theme**: Light and dark mode toggle with persistent preference.
- **Responsive**: Mobile-first responsive UI adapting seamlessly to desktop, tablet, and mobile screens.

---

## Supabase PostgreSQL & Auth Setup

### 1. Disable Email Confirmation in Supabase
Since this uses username-only authentication:
1. In your [Supabase Dashboard](https://supabase.com/dashboard), open your project.
2. Go to **Authentication** > **Providers** > **Email**.
3. Toggle **OFF** *"Confirm email"*.
4. Click **Save**.

### 2. Run Database Schema
1. In your Supabase Dashboard, open the **SQL Editor**.
2. Copy and paste the script from [`supabase/schema.sql`](supabase/schema.sql) and click **Run**:

```sql
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

create index if not exists idx_applications_user_date on public.applications (user_id, application_date desc);

alter table public.applications enable row level security;

create policy "Users can view own applications"
  on public.applications for select using (auth.uid() = user_id);

create policy "Users can insert own applications"
  on public.applications for insert with check (auth.uid() = user_id);

create policy "Users can update own applications"
  on public.applications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete own applications"
  on public.applications for delete using (auth.uid() = user_id);
```

---

## Environment Configuration

In your Supabase Dashboard, go to **Project Settings** > **API**. Copy your **Project URL** and **anon public key**.
Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm run start
```
