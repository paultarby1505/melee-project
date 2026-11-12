-- =====================================================================
-- Gestion des déplacements (Mêlée) : coût kilométrique des minibus
-- calculé à partir du prix réel du gazole.
--
-- À exécuter une fois dans le SQL Editor de Supabase (après minibus.sql).
-- Le script peut être relancé sans risque.
--
-- Source des prix : données publiques officielles « Prix des carburants
-- en France – Flux instantané v2 » (data.economie.gouv.fr), sans clé API.
-- La récupération se fait côté serveur (extension http + pg_cron), tous
-- les jours à 6 h (heure de Paris en hiver).
-- Si la récupération échoue, le dernier prix connu est conservé : aucun
-- prix n'est jamais inventé.
-- =====================================================================

create extension if not exists http with schema extensions;
create extension if not exists pg_cron;

-- ---------------------------------------------------------------------
-- Véhicules : consommation et coût d'usure modifiables
-- ---------------------------------------------------------------------

alter table public.minibus_vehicles
  add column if not exists fuel text not null default 'Diesel',
  add column if not exists consumption_l_100 numeric(5,2) not null default 0
    check (consumption_l_100 >= 0),
  add column if not exists wear_cost_per_km numeric(6,3) not null default 0
    check (wear_cost_per_km >= 0);

update public.minibus_vehicles
  set name = 'Minibus ancien', fuel = 'Diesel', consumption_l_100 = 8,
      wear_cost_per_km = 0.15
  where id = 'ancien' and consumption_l_100 = 0;

update public.minibus_vehicles
  set name = 'Minibus récent', fuel = 'Diesel', consumption_l_100 = 7.1,
      wear_cost_per_km = 0.15
  where id = 'recent' and consumption_l_100 = 0;

-- ---------------------------------------------------------------------
-- Déplacements : on garde le détail du calcul appliqué à chaque trajet
-- ---------------------------------------------------------------------

alter table public.minibus_trips
  add column if not exists fuel_price numeric(6,3),
  add column if not exists consumption_l_100 numeric(5,2),
  add column if not exists wear_cost_per_km numeric(6,3),
  add column if not exists fuel_cost numeric(10,2),
  add column if not exists wear_cost numeric(10,2),
  alter column cost_per_km type numeric(8,4);

-- ---------------------------------------------------------------------
-- Paramètres du prix du gazole (une seule ligne)
-- ---------------------------------------------------------------------

create table if not exists public.fuel_settings (
  id int primary key default 1 check (id = 1),
  -- national : prix moyen France ; station : station de référence ;
  -- manual : prix saisi à la main
  price_mode text not null default 'national'
    check (price_mode in ('national', 'station', 'manual')),
  station_id text,
  station_name text,
  station_address text,
  station_cp text,
  station_city text,
  manual_price numeric(6,3) check (manual_price is null or manual_price > 0),
  current_price numeric(6,3),
  price_source text,
  price_date timestamptz,
  last_refresh_at timestamptz,
  last_refresh_ok boolean,
  last_refresh_error text,
  updated_at timestamptz not null default now()
);

insert into public.fuel_settings (id) values (1) on conflict (id) do nothing;

-- Historique : prix récupérés, changements de station / de source.
create table if not exists public.fuel_history (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('price', 'station', 'mode', 'manual')),
  price numeric(6,3),
  source text,
  station_id text,
  station_name text,
  details text not null default '',
  created_by text not null default ''
);

create index if not exists fuel_history_created_idx
  on public.fuel_history (created_at desc);

alter table public.fuel_settings enable row level security;
alter table public.fuel_history enable row level security;

-- Même modèle d'accès que le reste de l'application (connexion gérée
-- par l'application elle-même).
drop policy if exists "anon select fuel_settings" on public.fuel_settings;
drop policy if exists "anon update fuel_settings" on public.fuel_settings;
drop policy if exists "anon select fuel_history" on public.fuel_history;
drop policy if exists "anon insert fuel_history" on public.fuel_history;
drop policy if exists "anon update minibus_vehicles" on public.minibus_vehicles;

create policy "anon select fuel_settings" on public.fuel_settings
  for select to anon using (true);
create policy "anon update fuel_settings" on public.fuel_settings
  for update to anon using (true) with check (true);
create policy "anon select fuel_history" on public.fuel_history
  for select to anon using (true);
create policy "anon insert fuel_history" on public.fuel_history
  for insert to anon with check (true);
create policy "anon update minibus_vehicles" on public.minibus_vehicles
  for update to anon using (true) with check (true);

grant usage, select on sequence public.fuel_history_id_seq to anon;

-- ---------------------------------------------------------------------
-- Appel à l'API officielle des prix des carburants
-- ---------------------------------------------------------------------

create or replace function public.fuel_api_get(p_query text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_resp extensions.http_response;
begin
  perform extensions.http_set_curlopt('CURLOPT_TIMEOUT', '20');
  select * into v_resp from extensions.http_get(
    'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/'
    || 'prix-des-carburants-en-france-flux-instantane-v2/records?' || p_query
  );
  if v_resp.status <> 200 then
    raise exception 'API prix carburants : HTTP %', v_resp.status;
  end if;
  return v_resp.content::jsonb;
end;
$$;

revoke all on function public.fuel_api_get(text) from public, anon, authenticated;

-- Les prix sont publiés en euros (ex. 1.789) ; par sécurité on gère
-- aussi l'ancien format en millièmes (ex. 1789).
create or replace function public.fuel_normalize_price(p numeric)
returns numeric
language sql
immutable
as $$
  select case when p is null then null
              when p > 10 then round(p / 1000, 3)
              else round(p, 3) end;
$$;

-- ---------------------------------------------------------------------
-- Actualisation du prix (tâche quotidienne + bouton « Actualiser »)
-- ---------------------------------------------------------------------

create or replace function public.refresh_fuel_price()
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  s public.fuel_settings;
  v_body jsonb;
  v_rec jsonb;
  v_price numeric;
  v_date timestamptz;
  v_source text;
begin
  select * into s from public.fuel_settings where id = 1 for update;

  begin
    if s.price_mode = 'manual' then
      if s.manual_price is null then
        raise exception 'Aucun prix manuel saisi.';
      end if;
      v_price := s.manual_price;
      v_date := s.updated_at;
      v_source := 'manual';

    elsif s.price_mode = 'station' then
      if s.station_id is null then
        raise exception 'Aucune station de référence sélectionnée.';
      end if;
      if s.station_id !~ '^[0-9]+$' then
        raise exception 'Identifiant de station invalide.';
      end if;
      v_body := public.fuel_api_get(
        'select=id,gazole_prix,gazole_maj&limit=1&where='
        || extensions.urlencode('id=' || s.station_id)
      );
      v_rec := v_body -> 'results' -> 0;
      if v_rec is null then
        raise exception 'Station introuvable dans les données officielles.';
      end if;
      v_price := public.fuel_normalize_price((v_rec ->> 'gazole_prix')::numeric);
      v_date := (v_rec ->> 'gazole_maj')::timestamptz;
      v_source := 'station';
      if v_price is null then
        raise exception 'Cette station n''affiche plus de prix du gazole.';
      end if;

    else
      -- Moyenne nationale des prix du gazole mis à jour ces 7 derniers jours.
      v_body := public.fuel_api_get(
        'select=' || extensions.urlencode('avg(gazole_prix) as prix, max(gazole_maj) as maj, count(*) as nb')
        || '&where=' || extensions.urlencode('gazole_prix is not null and gazole_maj >= now(days=-7)')
      );
      v_rec := v_body -> 'results' -> 0;
      v_price := public.fuel_normalize_price((v_rec ->> 'prix')::numeric);
      v_date := (v_rec ->> 'maj')::timestamptz;
      v_source := 'national';
      if v_price is null or coalesce((v_rec ->> 'nb')::int, 0) < 100 then
        raise exception 'Moyenne nationale indisponible.';
      end if;
    end if;

    if v_price < 0.5 or v_price > 5 then
      raise exception 'Prix reçu incohérent (% €/L), ignoré.', v_price;
    end if;

  exception when others then
    -- Échec : on garde le dernier prix connu et on le signale.
    update public.fuel_settings
      set last_refresh_at = now(), last_refresh_ok = false,
          last_refresh_error = sqlerrm
      where id = 1;
    return jsonb_build_object('ok', false, 'error', sqlerrm,
                              'price', s.current_price);
  end;

  if s.current_price is distinct from v_price
     or s.price_source is distinct from v_source then
    insert into public.fuel_history (kind, price, source, station_id, station_name, details)
    values ('price', v_price, v_source,
            case when v_source = 'station' then s.station_id end,
            case when v_source = 'station' then s.station_name end,
            case when s.current_price is null then 'Premier prix récupéré'
                 else 'Ancien prix : ' || s.current_price || ' €/L' end);
  end if;

  update public.fuel_settings
    set current_price = v_price, price_source = v_source, price_date = v_date,
        last_refresh_at = now(), last_refresh_ok = true,
        last_refresh_error = null
    where id = 1;

  return jsonb_build_object('ok', true, 'price', v_price, 'source', v_source,
                            'price_date', v_date);
end;
$$;

revoke all on function public.refresh_fuel_price() from public;
grant execute on function public.refresh_fuel_price() to anon, authenticated;

-- ---------------------------------------------------------------------
-- Recherche de stations (par ville / code postal, ou autour d'un point)
-- ---------------------------------------------------------------------

create or replace function public.search_fuel_stations(
  p_query text default null,
  p_lat double precision default null,
  p_lon double precision default null,
  p_radius_km int default 10
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_where text;
  v_order text := '';
  v_point text;
  v_body jsonb;
  v_q text := trim(coalesce(p_query, ''));
begin
  if p_lat is not null and p_lon is not null then
    v_point := format('geom''POINT(%s %s)''', p_lon, p_lat);
    v_where := format('within_distance(geom, %s, %skm)', v_point,
                      least(greatest(p_radius_km, 1), 50));
    v_order := '&order_by=' || extensions.urlencode('distance(geom, ' || v_point || ')');
  elsif v_q ~ '^[0-9]{2,5}$' then
    v_where := format('cp like %s', quote_literal(v_q || '*'));
  elsif length(v_q) >= 2 then
    v_where := format('search(ville, %s)', '"' || replace(v_q, '"', '') || '"');
  else
    raise exception 'Indique une ville ou un code postal.';
  end if;

  v_where := v_where || ' and gazole_prix is not null';

  v_body := public.fuel_api_get(
    'select=id,adresse,cp,ville,gazole_prix,gazole_maj,geom&limit=30&where='
    || extensions.urlencode(v_where) || v_order
  );

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', r ->> 'id',
      'address', r ->> 'adresse',
      'cp', r ->> 'cp',
      'city', r ->> 'ville',
      'price', public.fuel_normalize_price((r ->> 'gazole_prix')::numeric),
      'price_date', r ->> 'gazole_maj',
      'lat', (r -> 'geom' ->> 'lat')::float,
      'lon', (r -> 'geom' ->> 'lon')::float
    ))
    from jsonb_array_elements(v_body -> 'results') r
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.search_fuel_stations(text, double precision, double precision, int) from public;
grant execute on function public.search_fuel_stations(text, double precision, double precision, int) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Tâche quotidienne : tous les jours à 5 h UTC (6 h à Paris l'hiver)
-- ---------------------------------------------------------------------

select cron.unschedule(jobid) from cron.job where jobname = 'refresh-fuel-price';
select cron.schedule('refresh-fuel-price', '0 5 * * *',
                     'select public.refresh_fuel_price()');

-- Premier prix tout de suite.
select public.refresh_fuel_price();
