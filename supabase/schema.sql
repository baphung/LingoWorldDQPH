create extension if not exists pgcrypto;

create table if not exists public.languages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_vi text not null,
  name_native text not null,
  iso_639_1 text,
  iso_639_3 text,
  script text,
  direction text not null default 'ltr',
  family text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  language_id uuid not null references public.languages(id) on delete cascade,
  code text not null,
  title text not null,
  level text,
  description text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  unique(language_id, code)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  slug text not null,
  title text not null,
  subtitle text,
  lesson_type text not null default 'vocabulary',
  content jsonb not null default '{}'::jsonb,
  position integer not null default 0,
  xp integer not null default 10,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  unique(course_id, slug)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  streak integer not null default 0,
  xp integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  progress numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id, course_id)
);

create table if not exists public.lesson_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  score numeric(5,2),
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  language_slug text,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.languages enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.profiles enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_attempts enable row level security;
alter table public.ai_conversations enable row level security;

drop policy if exists "published languages are public" on public.languages;
create policy "published languages are public" on public.languages for select using (published = true);
drop policy if exists "published courses are public" on public.courses;
create policy "published courses are public" on public.courses for select using (published = true);
drop policy if exists "published lessons are public" on public.lessons;
create policy "published lessons are public" on public.lessons for select using (published = true);
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "own enrollments" on public.enrollments;
create policy "own enrollments" on public.enrollments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own attempts" on public.lesson_attempts;
create policy "own attempts" on public.lesson_attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own ai conversations" on public.ai_conversations;
create policy "own ai conversations" on public.ai_conversations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into public.languages (slug,name_vi,name_native,iso_639_1,iso_639_3,script,family) values
('chinese','Tiếng Trung','中文','zh','zho','Han','Sino-Tibetan'),
('english','Tiếng Anh','English','en','eng','Latin','Indo-European'),
('japanese','Tiếng Nhật','日本語','ja','jpn','Kana + Han','Japonic'),
('korean','Tiếng Hàn','한국어','ko','kor','Hangul','Koreanic'),
('french','Tiếng Pháp','Français','fr','fra','Latin','Indo-European'),
('german','Tiếng Đức','Deutsch','de','deu','Latin','Indo-European'),
('spanish','Tiếng Tây Ban Nha','Español','es','spa','Latin','Indo-European'),
('vietnamese','Tiếng Việt','Tiếng Việt','vi','vie','Latin','Austroasiatic')
on conflict (slug) do update set name_vi=excluded.name_vi, name_native=excluded.name_native, published=true;
