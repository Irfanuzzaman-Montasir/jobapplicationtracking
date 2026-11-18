# JobTrack — Personal Job Application Tracker

A clean, minimal, responsive personal job application tracking web app built with Next.js, TypeScript, Tailwind CSS, and Supabase PostgreSQL.

---

## Features

- **Dashboard Statistics**: Dynamic metrics computed directly from application data:
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

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL with Row-Level Security)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: Vercel ready

---

## Supabase PostgreSQL Database Setup

1. Go to [Supabase](https://supabase.com/) and create a new project.
2. In the Supabase Dashboard, navigate to the **SQL Editor**.
3. Open or copy the script from [`supabase/schema.sql`](supabase/schema.sql) and paste it into the SQL Editor:

```sql
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

-- 2. Create index on application_date
create index if not exists idx_applications_date on public.applications (application_date desc);

-- 3. Enable Row Level Security (RLS)
alter table public.applications enable row level security;

-- 4. Create RLS Policies for personal usage
create policy "Allow anonymous select on applications"
  on public.applications for select using (true);

create policy "Allow anonymous insert on applications"
  on public.applications for insert with check (true);

create policy "Allow anonymous update on applications"
  on public.applications for update using (true) with check (true);

create policy "Allow anonymous delete on applications"
  on public.applications for delete using (true);
```

4. Click **Run** to execute the query and set up your table with security policies.

---

## Environment Configuration

1. In your Supabase Dashboard, go to **Project Settings** > **API**.
2. Copy your **Project URL** and **anon/public API key**.
3. Create a `.env.local` file in the project root (see `.env.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> **Note**: If credentials are not yet configured, JobTrack automatically runs in demo mode with sample data stored in browser storage so you can test all features immediately.

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

---

## Project Structure

```
├── app/
│   ├── globals.css          # Tailwind CSS styles & dark mode config
│   ├── layout.tsx           # Root HTML layout with metadata
│   └── page.tsx             # Single main page (Dashboard + Table + Controls)
├── components/
│   ├── ApplicationModal.tsx     # Add / Edit application form dialog
│   ├── ApplicationTable.tsx     # Clean data table & mobile responsive cards
│   ├── DeleteConfirmModal.tsx   # Deletion confirmation dialog
│   ├── EmptyState.tsx           # Sensible zero-state and filter clear states
│   └── StatCard.tsx             # Metric cards for horizontal dashboard row
├── lib/
│   ├── api.ts               # Supabase CRUD operations & fallback data layer
│   └── supabase.ts          # Supabase client initialization & config check
├── supabase/
│   └── schema.sql           # PostgreSQL table definition, constraints & RLS
├── types/
│   └── index.ts             # TypeScript interfaces and union types
├── .env.example             # Example environment variable template
└── README.md
```

---

## Vercel Deployment

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Add the two environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**.
