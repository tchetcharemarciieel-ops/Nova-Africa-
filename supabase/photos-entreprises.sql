-- Kargora : photos, galerie, publications, parcours, entreprises. À appliquer sur le projet Supabase partagé.
-- Aucune table ZingoPay n'est touchée. Toutes les tables restent en RLS, sans droit direct ; tout passe par des fonctions.

alter table public.rp_profiles add column if not exists photo text check (photo is null or (photo like 'data:image/jpeg;base64,%' and char_length(photo) <= 60000));
alter table public.rp_profiles add column if not exists photo_mini text check (photo_mini is null or (photo_mini like 'data:image/jpeg;base64,%' and char_length(photo_mini) <= 8000));

create table if not exists public.rp_photos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.rp_profiles(id) on delete cascade,
  data text not null check (data like 'data:image/jpeg;base64,%' and char_length(data) <= 200000),
  thumb text not null check (thumb like 'data:image/jpeg;base64,%' and char_length(thumb) <= 40000),
  legende text not null default '' check (char_length(legende) <= 80),
  cree_le timestamptz not null default clock_timestamp()
);
create index if not exists rp_photos_profil on public.rp_photos (profile_id, cree_le desc);

create table if not exists public.rp_posts (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.rp_members(id) on delete cascade,
  texte text not null check (char_length(texte) between 3 and 500),
  data text check (data is null or (data like 'data:image/jpeg;base64,%' and char_length(data) <= 200000)),
  thumb text check (thumb is null or (thumb like 'data:image/jpeg;base64,%' and char_length(thumb) <= 40000)),
  publie boolean not null default true,
  cree_le timestamptz not null default clock_timestamp(),
  check ((data is null) = (thumb is null))
);
create index if not exists rp_posts_recent on public.rp_posts (cree_le desc) where publie;

create table if not exists public.rp_parcours (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.rp_profiles(id) on delete cascade,
  genre text not null check (genre in ('experience', 'formation')),
  titre text not null check (char_length(titre) between 2 and 80),
  organisme text not null default '' check (char_length(organisme) <= 80),
  periode text not null default '' check (char_length(periode) <= 30),
  cree_le timestamptz not null default clock_timestamp()
);
create index if not exists rp_parcours_profil on public.rp_parcours (profile_id, cree_le desc);

create table if not exists public.rp_orgs (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null unique references public.rp_members(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,40}$'),
  nom text not null check (char_length(nom) between 2 and 80),
  secteur text not null check (char_length(secteur) between 2 and 40),
  lieu text not null check (char_length(lieu) between 2 and 40),
  adresse text not null default '' check (char_length(adresse) <= 120),
  apropos text not null default '' check (char_length(apropos) <= 400),
  logo text check (logo is null or (logo like 'data:image/jpeg;base64,%' and char_length(logo) <= 60000)),
  logo_mini text check (logo_mini is null or (logo_mini like 'data:image/jpeg;base64,%' and char_length(logo_mini) <= 8000)),
  rccm text not null check (char_length(rccm) between 4 and 40),
  nif text not null check (char_length(nif) between 4 and 40),
  rh_nom text not null check (char_length(rh_nom) between 2 and 60),
  rh_tel text not null check (rh_tel ~ '^[0-9]{9,15}$'),
  statut text not null default 'attente' check (statut in ('attente', 'verifiee', 'refusee')),
  cree_le timestamptz not null default clock_timestamp(),
  verifie_le timestamptz
);

alter table public.rp_photos enable row level security;
alter table public.rp_posts enable row level security;
alter table public.rp_parcours enable row level security;
alter table public.rp_orgs enable row level security;
revoke all on public.rp_photos, public.rp_posts, public.rp_parcours, public.rp_orgs from anon, authenticated;

-- ===== Photo de profil
create or replace function public.rp_set_photo(p_secret text, p_photo text, p_mini text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_m uuid := private.rp_member(p_secret);
begin
  if v_m is null then raise exception 'RP_AUTH'; end if;
  if exists (select 1 from public.rp_profiles where member_id = v_m) then
    if p_photo is null or p_mini is null then update public.rp_profiles set photo = null, photo_mini = null where member_id = v_m;
    else update public.rp_profiles set photo = p_photo, photo_mini = p_mini where member_id = v_m; end if;
  elsif exists (select 1 from public.rp_orgs where member_id = v_m) then
    if p_photo is null or p_mini is null then update public.rp_orgs set logo = null, logo_mini = null where member_id = v_m;
    else update public.rp_orgs set logo = p_photo, logo_mini = p_mini where member_id = v_m; end if;
  else raise exception 'RP_PROFIL'; end if;
end $$;

-- ===== Galerie
create or replace function public.rp_add_photo(p_secret text, p_data text, p_thumb text, p_legende text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_m uuid := private.rp_member(p_secret); v_p uuid; v_id uuid;
begin
  if v_m is null then raise exception 'RP_AUTH'; end if;
  select id into v_p from public.rp_profiles where member_id = v_m;
  if v_p is null then raise exception 'RP_PROFIL'; end if;
  if (select count(*) from public.rp_photos where profile_id = v_p) >= 12 then raise exception 'RP_LIMITE'; end if;
  insert into public.rp_photos (profile_id, data, thumb, legende) values (v_p, p_data, p_thumb, btrim(coalesce(p_legende, ''))) returning id into v_id;
  return v_id;
end $$;

create or replace function public.rp_delete_photo(p_secret text, p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_m uuid := private.rp_member(p_secret);
begin
  if v_m is null then raise exception 'RP_AUTH'; end if;
  delete from public.rp_photos where id = p_id and profile_id in (select id from public.rp_profiles where member_id = v_m);
end $$;

create or replace function public.rp_photos(p_slug text) returns jsonb
language sql security definer set search_path = '' stable as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'thumb', x.thumb, 'legende', x.legende) order by x.cree_le desc), '[]'::jsonb)
  from public.rp_photos x join public.rp_profiles p on p.id = x.profile_id where p.slug = p_slug and p.publie
$$;

create or replace function public.rp_photo_full(p_id uuid) returns text
language sql security definer set search_path = '' stable as $$
  select x.data from public.rp_photos x join public.rp_profiles p on p.id = x.profile_id where x.id = p_id and p.publie
$$;

-- ===== Parcours (expériences et formations)
create or replace function public.rp_add_parcours(p_secret text, p_genre text, p_titre text, p_organisme text, p_periode text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_m uuid := private.rp_member(p_secret); v_p uuid; v_id uuid;
begin
  if v_m is null then raise exception 'RP_AUTH'; end if;
  select id into v_p from public.rp_profiles where member_id = v_m;
  if v_p is null then raise exception 'RP_PROFIL'; end if;
  if p_genre not in ('experience', 'formation') or char_length(btrim(coalesce(p_titre, ''))) < 2 then raise exception 'RP_TEXTE'; end if;
  if (select count(*) from public.rp_parcours where profile_id = v_p) >= 20 then raise exception 'RP_LIMITE'; end if;
  insert into public.rp_parcours (profile_id, genre, titre, organisme, periode)
  values (v_p, p_genre, left(btrim(p_titre), 80), left(btrim(coalesce(p_organisme, '')), 80), left(btrim(coalesce(p_periode, '')), 30)) returning id into v_id;
  return v_id;
end $$;

create or replace function public.rp_delete_parcours(p_secret text, p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_m uuid := private.rp_member(p_secret);
begin
  if v_m is null then raise exception 'RP_AUTH'; end if;
  delete from public.rp_parcours where id = p_id and profile_id in (select id from public.rp_profiles where member_id = v_m);
end $$;

-- ===== Publications du fil (réalisations, actualités)
create or replace function public.rp_post_create(p_secret text, p_texte text, p_data text, p_thumb text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_m uuid := private.rp_member(p_secret); v_id uuid;
begin
  if v_m is null then raise exception 'RP_AUTH'; end if;
  if p_texte is null or char_length(btrim(p_texte)) not between 3 and 500 then raise exception 'RP_TEXTE'; end if;
  if (select count(*) from public.rp_posts where member_id = v_m and cree_le > now() - interval '1 day') >= 10 then raise exception 'RP_LIMITE'; end if;
  insert into public.rp_posts (member_id, texte, data, thumb) values (v_m, btrim(p_texte), p_data, p_thumb) returning id into v_id;
  return v_id;
end $$;

create or replace function public.rp_list_posts(p_limit int default 20) returns jsonb
language sql security definer set search_path = '' stable as $$
  select coalesce(jsonb_agg(x), '[]'::jsonb) from (
    select jsonb_build_object('id', po.id, 'member_id', po.member_id, 'nom', m.nom,
      'slug', (select p.slug from public.rp_profiles p where p.member_id = po.member_id),
      'org_slug', (select o.slug from public.rp_orgs o where o.member_id = po.member_id),
      'verifiee', coalesce((select o.statut = 'verifiee' from public.rp_orgs o where o.member_id = po.member_id), false),
      'photo', coalesce((select p.photo_mini from public.rp_profiles p where p.member_id = po.member_id), (select o.logo_mini from public.rp_orgs o where o.member_id = po.member_id)),
      'lieu', coalesce((select p.lieu from public.rp_profiles p where p.member_id = po.member_id), (select o.lieu from public.rp_orgs o where o.member_id = po.member_id), ''),
      'texte', po.texte, 'thumb', po.thumb, 'cree_le', po.cree_le) as x
    from public.rp_posts po join public.rp_members m on m.id = po.member_id
    where po.publie order by po.cree_le desc limit least(greatest(coalesce(p_limit, 20), 1), 30)
  ) s
$$;

create or replace function public.rp_post_photo(p_id uuid) returns text
language sql security definer set search_path = '' stable as $$
  select data from public.rp_posts where id = p_id and publie
$$;

create or replace function public.rp_delete_post(p_secret text, p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_m uuid := private.rp_member(p_secret);
begin
  if v_m is null then raise exception 'RP_AUTH'; end if;
  delete from public.rp_posts where id = p_id and member_id = v_m;
end $$;

-- ===== Entreprises et ONG
create or replace function public.rp_org_register(p_secret text, p_nom text, p_secteur text, p_lieu text, p_adresse text, p_apropos text,
  p_logo text, p_logo_mini text, p_rccm text, p_nif text, p_rh_nom text, p_rh_tel text) returns text
language plpgsql security definer set search_path = '' as $$
declare v_m uuid := private.rp_member(p_secret); v_slug text; v_tel text := regexp_replace(coalesce(p_rh_tel, ''), '\D', '', 'g');
begin
  if v_m is null then raise exception 'RP_AUTH'; end if;
  if exists (select 1 from public.rp_orgs where member_id = v_m) then raise exception 'RP_DEJA'; end if;
  if p_nom is null or char_length(btrim(p_nom)) not between 2 and 80 then raise exception 'RP_NOM'; end if;
  if char_length(btrim(coalesce(p_rccm, ''))) < 4 or char_length(btrim(coalesce(p_nif, ''))) < 4 or char_length(btrim(coalesce(p_rh_nom, ''))) < 2 then raise exception 'RP_ORG'; end if;
  if char_length(v_tel) = 8 then v_tel := '236' || v_tel; end if;
  if v_tel !~ '^[0-9]{9,15}$' then raise exception 'RP_TEL'; end if;
  loop
    v_slug := left(trim(both '-' from regexp_replace(lower(translate(btrim(p_nom), 'àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ', 'aaaeeeeiioouuucAAAEEEEIIOOUUUC')), '[^a-z0-9]+', '-', 'g')), 30)
              || '-' || substr(md5(random()::text), 1, 4);
    exit when v_slug ~ '^[a-z0-9-]{3,40}$' and not exists (select 1 from public.rp_orgs where slug = v_slug);
  end loop;
  insert into public.rp_orgs (member_id, slug, nom, secteur, lieu, adresse, apropos, logo, logo_mini, rccm, nif, rh_nom, rh_tel)
  values (v_m, v_slug, btrim(p_nom), btrim(p_secteur), btrim(p_lieu), btrim(coalesce(p_adresse, '')), btrim(coalesce(p_apropos, '')),
          p_logo, p_logo_mini, btrim(p_rccm), btrim(p_nif), btrim(p_rh_nom), v_tel);
  update public.rp_members set nom = btrim(p_nom) where id = v_m;
  return v_slug;
end $$;

-- Page publique : jamais le RCCM, le NIF ni le téléphone du responsable.
create or replace function public.rp_org_get(p_slug text) returns jsonb
language plpgsql security definer set search_path = '' stable as $$
declare o public.rp_orgs; v_jobs jsonb;
begin
  select * into o from public.rp_orgs where slug = p_slug and statut <> 'refusee';
  if not found then return null; end if;
  select coalesce(jsonb_agg(jsonb_build_object('id', j.id, 'titre', j.titre, 'lieu', j.lieu, 'type', j.type, 'details', j.details, 'cree_le', j.cree_le) order by j.cree_le desc), '[]'::jsonb)
    into v_jobs from public.rp_jobs j where j.member_id = o.member_id and j.publie;
  return jsonb_build_object('slug', o.slug, 'member_id', o.member_id, 'nom', o.nom, 'secteur', o.secteur, 'lieu', o.lieu, 'adresse', o.adresse,
    'apropos', o.apropos, 'logo', o.logo, 'statut', o.statut, 'offres', v_jobs, 'cree_le', o.cree_le);
end $$;

create or replace function public.rp_org_post_job(p_secret text, p_titre text, p_lieu text, p_type text, p_details text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_m uuid := private.rp_member(p_secret); v_org text; v_id uuid;
begin
  if v_m is null then raise exception 'RP_AUTH'; end if;
  select nom into v_org from public.rp_orgs where member_id = v_m and statut <> 'refusee';
  if v_org is null then raise exception 'RP_ORG'; end if;
  if (select count(*) from public.rp_jobs where member_id = v_m and cree_le > now() - interval '1 day') >= 5 then raise exception 'RP_LIMITE'; end if;
  insert into public.rp_jobs (member_id, titre, organisation, lieu, type, details)
  values (v_m, btrim(p_titre), v_org, btrim(p_lieu), p_type, btrim(coalesce(p_details, ''))) returning id into v_id;
  return v_id;
end $$;

-- Seul le propriétaire du projet peut valider une entreprise (depuis Supabase, après avoir contrôlé le RCCM et le NIF) : fonction non accessible au public.
create or replace function public.rp_org_set_statut(p_slug text, p_statut text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_statut not in ('attente', 'verifiee', 'refusee') then raise exception 'RP_STATUT'; end if;
  update public.rp_orgs set statut = p_statut, verifie_le = case when p_statut = 'verifiee' then now() else null end where slug = p_slug;
end $$;
revoke all on function public.rp_org_set_statut(text, text) from public, anon, authenticated;

-- ===== Chiffres réels de la vitrine
create or replace function public.rp_stats() returns jsonb
language sql security definer set search_path = '' stable as $$
  select jsonb_build_object(
    'profils', (select count(*) from public.rp_profiles where publie),
    'entreprises', (select count(*) from public.rp_orgs where statut = 'verifiee'),
    'offres', (select count(*) from public.rp_jobs where publie),
    'chantiers', (select count(*) from public.rp_confirmations))
$$;

-- ===== Fonctions existantes, enrichies (même paramètres, champs en plus)
create or replace function public.rp_me(p_secret text) returns jsonb
language plpgsql security definer set search_path = '' stable as $$
declare v_m uuid := private.rp_member(p_secret); v_nom text; v_slug text; v_photo text; v_org text; v_st text; v_logo text;
begin
  if v_m is null then return null; end if;
  select nom into v_nom from public.rp_members where id = v_m;
  select slug, photo_mini into v_slug, v_photo from public.rp_profiles where member_id = v_m;
  select slug, statut, logo_mini into v_org, v_st, v_logo from public.rp_orgs where member_id = v_m;
  return jsonb_build_object('member_id', v_m, 'nom', v_nom, 'slug', v_slug, 'photo', coalesce(v_photo, v_logo), 'org_slug', v_org, 'org_statut', v_st);
end $$;

create or replace function public.rp_get_profile(p_slug text) returns jsonb
language plpgsql security definer set search_path = '' stable as $$
declare p public.rp_profiles; v_n int; v_avg numeric; v_avis jsonb; v_parc jsonb;
begin
  select * into p from public.rp_profiles where slug = p_slug and publie;
  if not found then return null; end if;
  select count(*), coalesce(round(avg(note)::numeric, 1), 0) into v_n, v_avg from public.rp_confirmations where profile_id = p.id;
  select coalesce(jsonb_agg(jsonb_build_object('note', c.note, 'avis', c.avis, 'prenom', c.prenom, 'travail', c.travail, 'cree_le', c.cree_le) order by c.cree_le desc), '[]'::jsonb)
    into v_avis from (select * from public.rp_confirmations where profile_id = p.id order by cree_le desc limit 10) c;
  select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'genre', x.genre, 'titre', x.titre, 'organisme', x.organisme, 'periode', x.periode) order by x.cree_le desc), '[]'::jsonb)
    into v_parc from public.rp_parcours x where x.profile_id = p.id;
  return jsonb_build_object('slug', p.slug, 'member_id', p.member_id, 'nom', p.nom, 'metier', p.metier, 'lieu', p.lieu,
    'apropos', p.apropos, 'langues', to_jsonb(p.langues), 'telephone', p.telephone, 'photo', p.photo, 'chantiers', v_n, 'moyenne', v_avg,
    'niveau', case when char_length(p.apropos) >= 20 then 2 else 1 end, 'avis', v_avis, 'parcours', v_parc, 'cree_le', p.cree_le);
end $$;

create or replace function public.rp_search_profiles(p_metier text, p_lieu text, p_limit int default 30) returns jsonb
language sql security definer set search_path = '' stable as $$
  select coalesce(jsonb_agg(x), '[]'::jsonb) from (
    select jsonb_build_object('slug', p.slug, 'nom', p.nom, 'metier', p.metier, 'lieu', p.lieu, 'photo', p.photo_mini,
      'chantiers', (select count(*) from public.rp_confirmations c where c.profile_id = p.id),
      'niveau', case when char_length(p.apropos) >= 20 then 2 else 1 end) as x
    from public.rp_profiles p
    where p.publie and (coalesce(p_metier, '') = '' or p.metier = p_metier) and (coalesce(p_lieu, '') = '' or p.lieu = p_lieu)
    order by (select count(*) from public.rp_confirmations c where c.profile_id = p.id) desc, p.cree_le desc
    limit least(greatest(coalesce(p_limit, 30), 1), 50)
  ) s
$$;

create or replace function public.rp_list_needs(p_limit int default 30) returns jsonb
language sql security definer set search_path = '' stable as $$
  select coalesce(jsonb_agg(x), '[]'::jsonb) from (
    select jsonb_build_object('id', n.id, 'member_id', n.member_id, 'nom', m.nom,
      'photo', (select p.photo_mini from public.rp_profiles p where p.member_id = n.member_id),
      'titre', n.titre, 'metier', n.metier, 'lieu', n.lieu, 'details', n.details, 'cree_le', n.cree_le) as x
    from public.rp_needs n join public.rp_members m on m.id = n.member_id
    where n.publie order by n.cree_le desc limit least(greatest(coalesce(p_limit, 30), 1), 50)
  ) s
$$;

create or replace function public.rp_list_jobs(p_limit int default 30) returns jsonb
language sql security definer set search_path = '' stable as $$
  select coalesce(jsonb_agg(x), '[]'::jsonb) from (
    select jsonb_build_object('id', j.id, 'member_id', j.member_id, 'titre', j.titre, 'organisation', j.organisation,
      'lieu', j.lieu, 'type', j.type, 'details', j.details, 'cree_le', j.cree_le,
      'org_slug', (select o.slug from public.rp_orgs o where o.member_id = j.member_id),
      'logo', (select o.logo_mini from public.rp_orgs o where o.member_id = j.member_id),
      'verifiee', coalesce((select o.statut = 'verifiee' from public.rp_orgs o where o.member_id = j.member_id), false)) as x
    from public.rp_jobs j where j.publie order by j.cree_le desc limit least(greatest(coalesce(p_limit, 30), 1), 50)
  ) s
$$;

revoke all on function public.rp_set_photo(text, text, text), public.rp_add_photo(text, text, text, text), public.rp_delete_photo(text, uuid),
  public.rp_photos(text), public.rp_photo_full(uuid), public.rp_add_parcours(text, text, text, text, text), public.rp_delete_parcours(text, uuid),
  public.rp_post_create(text, text, text, text), public.rp_list_posts(int), public.rp_post_photo(uuid), public.rp_delete_post(text, uuid),
  public.rp_org_register(text, text, text, text, text, text, text, text, text, text, text, text), public.rp_org_get(text),
  public.rp_org_post_job(text, text, text, text, text), public.rp_stats() from public;
grant execute on function public.rp_set_photo(text, text, text), public.rp_add_photo(text, text, text, text), public.rp_delete_photo(text, uuid),
  public.rp_photos(text), public.rp_photo_full(uuid), public.rp_add_parcours(text, text, text, text, text), public.rp_delete_parcours(text, uuid),
  public.rp_post_create(text, text, text, text), public.rp_list_posts(int), public.rp_post_photo(uuid), public.rp_delete_post(text, uuid),
  public.rp_org_register(text, text, text, text, text, text, text, text, text, text, text, text), public.rp_org_get(text),
  public.rp_org_post_job(text, text, text, text, text), public.rp_stats() to anon, authenticated;
