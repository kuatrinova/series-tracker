create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.series (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  year integer,
  genre text,
  description text,
  ai_status text,
  rating numeric(3,1),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create table if not exists public.seasons (
  id uuid default gen_random_uuid() primary key,
  series_id uuid references public.series(id) on delete cascade,
  number integer not null,
  episode_count integer not null,
  constraint unique_season unique(series_id, number)
);

create table if not exists public.user_series (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  series_id uuid references public.series(id) on delete cascade,
  platform text default 'Otra',
  status text default 'watching' check (status in ('watching','pending','finished','dropped')),
  added_at timestamptz default now(),
  shared_by uuid references public.profiles(id),
  constraint unique_user_series unique(user_id, series_id)
);

create table if not exists public.watched_episodes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  series_id uuid references public.series(id) on delete cascade,
  season_number integer not null,
  episode_number integer not null,
  watched_at timestamptz default now(),
  constraint unique_watched unique(user_id, series_id, season_number, episode_number)
);

alter table public.profiles enable row level security;
alter table public.series enable row level security;
alter table public.seasons enable row level security;
alter table public.user_series enable row level security;
alter table public.watched_episodes enable row level security;

drop policy if exists "Profiles visibles para todos los autenticados" on public.profiles;
drop policy if exists "Usuario edita su propio perfil" on public.profiles;
drop policy if exists "Perfil se crea al registrarse" on public.profiles;
drop policy if exists "Series visibles para autenticados" on public.series;
drop policy if exists "Cualquiera puede crear series" on public.series;
drop policy if exists "Seasons visibles para autenticados" on public.seasons;
drop policy if exists "Cualquiera puede crear seasons" on public.seasons;
drop policy if exists "user_series solo del propio usuario" on public.user_series;
drop policy if exists "usuario gestiona su user_series" on public.user_series;
drop policy if exists "admin puede insertar en user_series de otros" on public.user_series;
drop policy if exists "watched_episodes solo del propio usuario" on public.watched_episodes;

create policy "Profiles visibles para todos los autenticados" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "Usuario edita su propio perfil" on public.profiles
  for update using (auth.uid() = id);

create policy "Perfil se crea al registrarse" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Series visibles para autenticados" on public.series
  for select using (auth.role() = 'authenticated');

create policy "Cualquiera puede crear series" on public.series
  for insert with check (auth.role() = 'authenticated');

create policy "Seasons visibles para autenticados" on public.seasons
  for select using (auth.role() = 'authenticated');

create policy "Cualquiera puede crear seasons" on public.seasons
  for insert with check (auth.role() = 'authenticated');

create policy "user_series solo del propio usuario" on public.user_series
  for select using (auth.uid() = user_id);

create policy "usuario gestiona su user_series" on public.user_series
  for all using (auth.uid() = user_id);

create policy "admin puede insertar en user_series de otros" on public.user_series
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "watched_episodes solo del propio usuario" on public.watched_episodes
  for all using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, new.raw_user_meta_data->>'email', new.id::text),
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(coalesce(new.email, new.raw_user_meta_data->>'email', new.id::text), '@', 1)
    )
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
