-- Suivi des déplacements (Mêlée) : informations supplémentaires sur
-- chaque déplacement. À exécuter une fois dans le SQL Editor de Supabase
-- (après deplacements.sql). Peut être relancé sans risque.

alter table public.minibus_trips
  add column if not exists trip_name text not null default '',
  add column if not exists category text not null default '',
  add column if not exists purpose text not null default '',
  add column if not exists departure_lat double precision,
  add column if not exists departure_lon double precision,
  add column if not exists arrival_lat double precision,
  add column if not exists arrival_lon double precision,
  add column if not exists duration_min numeric(7,1),
  add column if not exists route_summary text not null default '',
  -- auto : distance calculée par l'itinéraire routier ;
  -- manual : distance saisie et confirmée à la main
  add column if not exists distance_source text not null default 'manual'
    check (distance_source in ('auto', 'manual'));

create index if not exists minibus_trips_date_idx
  on public.minibus_trips (trip_date desc);
