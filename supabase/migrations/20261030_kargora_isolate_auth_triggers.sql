-- À EXÉCUTER UNE FOIS dans Supabase > SQL Editor (projet Aletchcard), AVANT d'ouvrir les inscriptions KARGORA.
-- Les 5 déclencheurs d'Aletchcard sont recréés à l'identique, avec une condition en plus :
-- ils ne s'exécutent plus pour les comptes marqués app = 'kargora'. Les comptes Aletchcard ne changent pas.
do $$
declare r record; d text;
  cond text := $c$coalesce(new.raw_user_meta_data->>'app','') <> 'kargora'$c$;
  n int := 0;
begin
  for r in
    select t.tgname, pg_get_triggerdef(t.oid) as def
    from pg_trigger t
    where t.tgrelid = 'auth.users'::regclass and not t.tgisinternal
      and t.tgname in ('on_auth_user_create_pending_client_access','on_auth_user_created',
                       'on_auth_user_created_customer_profile','on_auth_user_family_beta_reservation',
                       'pilot_demo_auth_signup')
  loop
    d := replace(r.def, ' FOR EACH ROW EXECUTE', ' FOR EACH ROW WHEN (' || cond || ') EXECUTE');
    if d = r.def then raise exception 'Motif introuvable pour %', r.tgname; end if;
    execute format('drop trigger %I on auth.users', r.tgname);
    execute d;
    n := n + 1;
  end loop;
  if n <> 5 then raise exception '% déclencheurs modifiés au lieu de 5', n; end if;
end $$;
-- Vérification : doit afficher 5 lignes contenant « WHEN »
select tgname, pg_get_triggerdef(oid) like '%WHEN%' as protege from pg_trigger
where tgrelid = 'auth.users'::regclass and not tgisinternal order by 1;
