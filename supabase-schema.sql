-- =============================================================
-- TRENDY TOUCH SUPABASE SCHEMA (Idempotent / Repeatable)
-- Run this entire file in: Supabase → SQL Editor → New Query
-- =============================================================

-- 1. BOOKINGS TABLE
create table if not exists public.bookings (
    id          text primary key default ('BK-' || upper(substr(gen_random_uuid()::text, 1, 8))),
    name        text not null,
    phone       text not null,
    email       text,
    service_type text not null check (service_type in ('Studio', 'Home')),
    address     text,
    package     text not null,
    addons      text[] default '{}',
    date_time   timestamptz not null,
    notes       text,
    total_price numeric(10,2) default 0,
    status      text not null default 'Pending' check (status in ('Pending', 'Confirmed', 'Rescheduled', 'Cancelled')),
    created_at  timestamptz default now()
);

-- Enable RLS
alter table public.bookings enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Allow public booking insert" on public.bookings;
drop policy if exists "Staff full access to bookings" on public.bookings;

-- Create policies
create policy "Allow public booking insert"
    on public.bookings for insert to anon
    with check (true);

create policy "Staff full access to bookings"
    on public.bookings for all to authenticated
    using (true)
    with check (true);


-- 2. STUDENTS TABLE
create table if not exists public.students (
    student_id  text primary key,
    name        text not null,
    phone       text not null,
    email       text not null unique,
    course_name text not null,
    start_date  date,
    note        text,
    status      text not null default 'Pre-Booked' check (status in ('Pre-Booked', 'Confirmed', 'Dropped')),
    visit_date  date,
    created_at  timestamptz default now()
);

-- Enable RLS
alter table public.students enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Allow public student insert" on public.students;
drop policy if exists "Staff can read all students" on public.students;
drop policy if exists "Staff can update students" on public.students;
drop policy if exists "Students can read own record" on public.students;

-- Create policies
create policy "Allow public student insert"
    on public.students for insert to anon
    with check (true);

create policy "Staff can read all students"
    on public.students for select to authenticated
    using (true);

create policy "Staff can update students"
    on public.students for update to authenticated
    using (true)
    with check (true);

create policy "Students can read own record"
    on public.students for select to authenticated
    using (email = auth.jwt() ->> 'email');


-- 3. GALLERY TABLE
create table if not exists public.gallery (
    id          uuid primary key default gen_random_uuid(),
    posted_by   text not null,
    tag         text not null,
    caption     text not null,
    type        text not null check (type in ('photo', 'video')),
    media_url   text not null,
    created_at  timestamptz default now()
);

-- Enable RLS
alter table public.gallery enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Public gallery read" on public.gallery;
drop policy if exists "Staff manage gallery" on public.gallery;

-- Create policies
create policy "Public gallery read"
    on public.gallery for select to anon, authenticated
    using (true);

create policy "Staff manage gallery"
    on public.gallery for all to authenticated
    using (true)
    with check (true);


-- 4. FEEDBACKS TABLE
create table if not exists public.feedbacks (
    id          uuid primary key default gen_random_uuid(),
    name        text not null,
    service     text not null,
    rating      smallint not null check (rating between 1 and 5),
    comment     text not null,
    created_at  timestamptz default now()
);

-- Enable RLS
alter table public.feedbacks enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Public feedback insert" on public.feedbacks;
drop policy if exists "Public feedback read" on public.feedbacks;
drop policy if exists "Staff delete feedbacks" on public.feedbacks;

-- Create policies
create policy "Public feedback insert"
    on public.feedbacks for insert to anon, authenticated
    with check (true);

create policy "Public feedback read"
    on public.feedbacks for select to anon, authenticated
    using (true);

create policy "Staff delete feedbacks"
    on public.feedbacks for delete to authenticated
    using (true);


-- =============================================================
-- SUPABASE STORAGE BUCKETS
-- =============================================================

-- Gallery media bucket (photos/videos)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'gallery',
    'gallery',
    true,
    52428800,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do nothing;

-- Drop existing storage policies if they exist
drop policy if exists "Gallery public read" on storage.objects;
drop policy if exists "Staff can upload gallery" on storage.objects;
drop policy if exists "Staff can delete gallery" on storage.objects;

-- Create storage policies
create policy "Gallery public read"
    on storage.objects for select to anon, authenticated
    using (bucket_id = 'gallery');

create policy "Staff can upload gallery"
    on storage.objects for insert to authenticated
    with check (bucket_id = 'gallery');

create policy "Staff can delete gallery"
    on storage.objects for delete to authenticated
    using (bucket_id = 'gallery');


-- =============================================================
-- REALTIME SUBSCRIPTIONS
-- =============================================================

-- Safely add tables to supabase_realtime publication only if they are not already members
do $$
begin
    if not exists (
        select 1 from pg_publication_tables 
        where pubname = 'supabase_realtime' 
        and schemaname = 'public' 
        and tablename = 'bookings'
    ) then
        alter publication supabase_realtime add table public.bookings;
    end if;

    if not exists (
        select 1 from pg_publication_tables 
        where pubname = 'supabase_realtime' 
        and schemaname = 'public' 
        and tablename = 'students'
    ) then
        alter publication supabase_realtime add table public.students;
    end if;
end $$;
