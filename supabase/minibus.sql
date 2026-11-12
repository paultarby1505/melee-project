-- Onglet « Minibus » de Mêlée : à exécuter une fois dans le SQL Editor
-- de Supabase. Même modèle d'accès que les autres tables de l'app.

create table if not exists public.minibus_vehicles (
  id text primary key check (id in ('ancien', 'recent')),
  name text not null,
  cost_per_km numeric(6,3) not null default 0 check (cost_per_km >= 0),
  updated_at timestamptz not null default now()
);

-- Tarifs de départ, modifiables depuis l'onglet Minibus.
insert into public.minibus_vehicles (id, name, cost_per_km) values
  ('ancien', 'Ancien minibus', 0.35),
  ('recent', 'Minibus récent', 0.30)
on conflict (id) do nothing;

create table if not exists public.minibus_trips (
  id text primary key,
  trip_date date not null,
  vehicle text not null references public.minibus_vehicles(id),
  departure text not null,
  arrival text not null,
  round_trip boolean not null default false,
  km_one_way numeric(8,1) not null check (km_one_way >= 0),
  km_total numeric(8,1) not null check (km_total >= 0),
  -- tarif appliqué au moment de la saisie
  cost_per_km numeric(6,3) not null check (cost_per_km >= 0),
  total_cost numeric(10,2) not null check (total_cost >= 0),
  reason text not null default '',
  driver text not null default '',
  created_by text not null default '',
  created_at timestamptz not null default now()
);

alter table public.minibus_vehicles enable row level security;
alter table public.minibus_trips enable row level security;

create policy "anon select minibus_vehicles" on public.minibus_vehicles
  for select to anon using (true);
create policy "anon update minibus_vehicles" on public.minibus_vehicles
  for update to anon using (true) with check (true);

create policy "anon select minibus_trips" on public.minibus_trips
  for select to anon using (true);
create policy "anon insert minibus_trips" on public.minibus_trips
  for insert to anon with check (true);
create policy "anon update minibus_trips" on public.minibus_trips
  for update to anon using (true) with check (true);
create policy "anon delete minibus_trips" on public.minibus_trips
  for delete to anon using (true);
