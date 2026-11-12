-- Effectifs OB / USB par déplacement (Gestion de l'entente).
-- À exécuter après deplacements-suivi.sql. Peut être relancé sans risque.
alter table public.minibus_trips
  add column if not exists ob_count integer check (ob_count is null or ob_count >= 0),
  add column if not exists usb_count integer check (usb_count is null or usb_count >= 0);
