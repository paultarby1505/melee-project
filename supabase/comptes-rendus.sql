-- Section « Comptes rendus » de Mêlée : à exécuter une fois dans le SQL
-- Editor de Supabase. Même modèle d'accès que les autres tables de l'app.
--
-- Deux sortes de comptes rendus :
--   source = 'redige'  : écrit ou dicté dans Mêlée, mis en forme par l'IA,
--                        puis validé ; le PDF généré est rangé dans Documents.
--   source = 'externe' : compte rendu d'une autre réunion déposé tel quel
--                        (PDF, Word, photo…), rangé lui aussi dans Documents.

create table if not exists public.comptes_rendus (
  id text primary key,
  source text not null default 'redige' check (source in ('redige', 'externe')),
  status text not null default 'brouillon' check (status in ('brouillon', 'valide')),
  title text not null,
  meeting_date date,
  location text not null default '',
  participants text not null default '',
  -- notes brutes saisies ou dictées
  notes text not null default '',
  -- version retravaillée par l'IA puis relue :
  -- { resume, points: [{ titre, contenu }], decisions: [], actions: [{ action, responsable, echeance }], prochaine_reunion }
  content jsonb,
  -- PDF validé (source 'redige') ou fichier déposé (source 'externe')
  document_id text references public.documents(id) on delete set null,
  created_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  validated_by text not null default '',
  validated_at timestamptz
);

create index if not exists comptes_rendus_meeting_date_idx
  on public.comptes_rendus (meeting_date desc);

alter table public.comptes_rendus enable row level security;

create policy "anon select comptes_rendus" on public.comptes_rendus
  for select to anon using (true);
create policy "anon insert comptes_rendus" on public.comptes_rendus
  for insert to anon with check (true);
create policy "anon update comptes_rendus" on public.comptes_rendus
  for update to anon using (true) with check (true);
create policy "anon delete comptes_rendus" on public.comptes_rendus
  for delete to anon using (true);
