-- Kargora : scores des mini-jeux quotidiens (affichés sur le profil). Aucune table ZingoPay n'est touchée.
create table if not exists public.rp_scores (
  member_id uuid not null references public.rp_members(id) on delete cascade,
  jeu text not null check (jeu in ('lien', 'grille', 'quiz')),
  jour date not null,
  points int not null check (points between 0 and 100),
  cree_le timestamptz not null default clock_timestamp(),
  primary key (member_id, jeu, jour)
);
alter table public.rp_scores enable row level security;
revoke all on public.rp_scores from anon, authenticated;

-- Un seul score par jeu et par jour ; le jour doit être celui de Bangui (hier, aujourd'hui) pour éviter les scores antidatés.
create or replace function public.rp_save_score(p_secret text, p_jeu text, p_jour date, p_points int) returns void
language plpgsql security definer set search_path = '' as $$
declare v_m uuid := private.rp_member(p_secret); v_auj date := (now() at time zone 'Africa/Bangui')::date;
begin
  if v_m is null then raise exception 'RP_AUTH'; end if;
  if p_jeu not in ('lien', 'grille', 'quiz') or p_points is null or p_points not between 0 and 100 or p_jour is null or p_jour not between v_auj - 1 and v_auj then raise exception 'RP_TEXTE'; end if;
  insert into public.rp_scores (member_id, jeu, jour, points) values (v_m, p_jeu, p_jour, p_points) on conflict do nothing;
end $$;

create or replace function public.rp_scores(p_slug text) returns jsonb
language sql security definer set search_path = '' stable as $$
  select jsonb_build_object('total', coalesce(sum(s.points), 0), 'jours', count(distinct s.jour))
  from public.rp_scores s join public.rp_profiles p on p.member_id = s.member_id where p.slug = p_slug and p.publie
$$;

revoke all on function public.rp_save_score(text, text, date, int), public.rp_scores(text) from public;
grant execute on function public.rp_save_score(text, text, date, int), public.rp_scores(text) to anon, authenticated;
