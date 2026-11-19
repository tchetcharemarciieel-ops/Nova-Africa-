-- BROUILLON, NON APPLIQUÉ. À relire avant toute application sur la base de ZingoPay.
-- Objectif : garder les cartes pro de façon partagée, sans toucher aux tables de ZingoPay.
-- Toutes les tables ont le préfixe rp_ ; la sécurité par ligne (RLS) est activée sur chacune.

create table if not exists public.rp_cards (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,40}$'),
  nom text not null check (char_length(nom) between 2 and 60),
  metier text not null,
  lieu text not null,
  telephone text not null check (telephone ~ '^[0-9]{9,15}$'),
  apropos text not null default '' check (char_length(apropos) <= 300),
  langues text[] not null default '{}',
  verifie boolean not null default false,      -- niveau « identité vérifiée », plus tard
  publie boolean not null default true,         -- permet de retirer un faux profil
  cree_le timestamptz not null default now()
);

alter table public.rp_cards enable row level security;

-- Lecture publique des cartes publiées uniquement. Aucune écriture directe depuis le navigateur :
-- la création passera par une route serveur qui limite le nombre de demandes (anti-abus).
create policy rp_cards_lecture on public.rp_cards for select using (publie);

create index if not exists rp_cards_recherche on public.rp_cards (metier, lieu) where publie;
