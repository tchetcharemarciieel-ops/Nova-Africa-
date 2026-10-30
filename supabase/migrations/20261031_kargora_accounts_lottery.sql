-- Comptes clients + tirages au sort. À appliquer APRÈS kargora_isolate_auth_triggers.
alter table public.kargora_requests add column user_id uuid references auth.users(id) on delete set null;
create index on public.kargora_requests (user_id);
alter table public.kargora_messages add column user_id uuid references auth.users(id) on delete set null;

-- les dépôts de demande rattachent la demande au compte connecté (si connecté)
create or replace function public.kargora_submit_request(
  p_full_name text, p_phone text, p_profile text, p_description text, p_url text,
  p_quantity int, p_origin text, p_budget bigint, p_comment text, p_files text[]
) returns text language plpgsql security definer set search_path = '' as $$
declare v_number text; v_id uuid; v_f text;
begin
  if char_length(public.kargora_phone_key(p_phone)) < 8 then raise exception 'Numéro de téléphone invalide'; end if;
  foreach v_f in array coalesce(p_files, '{}') loop
    if v_f !~ '^requests/[0-9a-fA-F-]{36}/[A-Za-z0-9._-]{1,120}$' then raise exception 'Chemin de fichier invalide'; end if;
  end loop;
  if coalesce(array_length(p_files,1),0) > 5 then raise exception 'Trop de fichiers'; end if;
  v_number := 'KRG-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
  insert into public.kargora_requests(number, full_name, phone, profile, product_description, product_url,
    quantity, preferred_origin, budget_indicatif, comment, file_paths, user_id)
  values (v_number, btrim(p_full_name), btrim(p_phone), p_profile, btrim(p_description), nullif(btrim(p_url),''),
    coalesce(p_quantity,1), nullif(btrim(p_origin),''), p_budget, nullif(btrim(p_comment),''), coalesce(p_files,'{}'),
    (select auth.uid()))
  returning id into v_id;
  insert into public.kargora_status_history(request_id, status_code, public_note)
  values (v_id, 1, 'Votre demande a bien été reçue. Elle doit être étudiée ; ce n''est pas une commande payée.');
  return v_number;
end $$;

create or replace function public.kargora_submit_digital_request(
  p_full_name text, p_phone text, p_profile text, p_service text,
  p_description text, p_quantity int, p_budget bigint
) returns text language plpgsql security definer set search_path = '' as $$
declare v_number text; v_id uuid;
begin
  if char_length(public.kargora_phone_key(p_phone)) < 8 then raise exception 'Numéro de téléphone invalide'; end if;
  v_number := 'KRG-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
  insert into public.kargora_requests(number, full_name, phone, profile, product_description,
    quantity, budget_indicatif, kind, service, user_id)
  values (v_number, btrim(p_full_name), btrim(p_phone), p_profile, btrim(p_description),
    coalesce(p_quantity,1), p_budget, 'numerique', p_service, (select auth.uid()))
  returning id into v_id;
  insert into public.kargora_status_history(request_id, status_code, public_note)
  values (v_id, 1, 'Votre demande a bien été reçue. Elle doit être étudiée ; ce n''est pas une commande payée.');
  return v_number;
end $$;

create or replace function public.kargora_send_message(p_name text, p_phone text, p_email text, p_message text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into public.kargora_messages(full_name, phone, email, message, user_id)
  values (btrim(p_name), nullif(btrim(p_phone),''), nullif(btrim(p_email),''), btrim(p_message), (select auth.uid()));
end $$;

-- ---------- Espace client (connecté uniquement) ----------
create function public.kargora_my_requests() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'number', r.number, 'kind', r.kind, 'service', r.service, 'product', r.product_description,
    'quantity', r.quantity, 'status_code', r.status_code, 'status', s.label,
    'created_at', r.created_at, 'updated_at', r.updated_at,
    'quote_status', (select q.status from public.kargora_quotes q where q.request_id = r.id and q.status <> 'draft' order by q.created_at desc limit 1),
    'quote_total', (select q.total from public.kargora_quotes q where q.request_id = r.id and q.status <> 'draft' order by q.created_at desc limit 1)
  ) order by r.created_at desc), '[]'::jsonb)
  from public.kargora_requests r join public.kargora_statuses s on s.code = r.status_code
  where r.user_id = (select auth.uid());
$$;

create function public.kargora_my_request(p_number text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_phone text;
begin
  select phone into v_phone from public.kargora_requests
   where number = upper(btrim(p_number)) and user_id = (select auth.uid());
  if not found then return null; end if;
  return public.kargora_track(p_number, v_phone);
end $$;

create function public.kargora_my_respond(p_number text, p_accept boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_phone text;
begin
  select phone into v_phone from public.kargora_requests
   where number = upper(btrim(p_number)) and user_id = (select auth.uid());
  if not found then raise exception 'Demande introuvable'; end if;
  return public.kargora_respond_quote(p_number, v_phone, p_accept);
end $$;

create function public.kargora_claim_request(p_number text, p_phone text) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  update public.kargora_requests set user_id = (select auth.uid())
   where number = upper(btrim(p_number)) and user_id is null
     and public.kargora_phone_key(phone) = public.kargora_phone_key(p_phone);
  return found;
end $$;

create function public.kargora_my_summary() returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'total', count(*),
    'in_progress', count(*) filter (where status_code not in (13,14)),
    'quotes_to_accept', count(*) filter (where status_code = 3),
    'payments_pending', count(*) filter (where status_code = 4),
    'ready_for_pickup', count(*) filter (where status_code = 12),
    'delivered', count(*) filter (where status_code = 13))
  from public.kargora_requests where user_id = (select auth.uid());
$$;

-- ---------- Tirages au sort (participation gratuite) ----------
insert into public.kargora_settings(key,value) values ('lottery_prize',''), ('lottery_hours','6,10');

create table public.kargora_draws (
  id uuid primary key default gen_random_uuid(),
  scheduled_at timestamptz not null unique,
  prize text not null,
  status text not null default 'open' check (status in ('open','drawn','no_entries','cancelled')),
  entries_count int,
  winner_user_id uuid references auth.users(id) on delete set null,
  winner_display text,
  drawn_at timestamptz,
  prize_status text not null default 'pending' check (prize_status in ('pending','contacted','delivered','forfeited')),
  admin_note text,
  created_at timestamptz not null default now()
);
create table public.kargora_draw_entries (
  draw_id uuid not null references public.kargora_draws(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (draw_id, user_id)
);
alter table public.kargora_draws enable row level security;
alter table public.kargora_draw_entries enable row level security;
create policy kargora_admin_all on public.kargora_draws for all to authenticated
  using ((select public.kargora_is_admin())) with check ((select public.kargora_is_admin()));
create policy kargora_admin_read on public.kargora_draw_entries for select to authenticated
  using ((select public.kargora_is_admin()));

create function public.kargora__run_due_draws() returns void
language plpgsql security definer set search_path = '' as $$
declare d record; v_user uuid; v_n int; v_name text; v_phone text; v_disp text;
begin
  for d in select * from public.kargora_draws where status = 'open' and scheduled_at <= now()
           order by scheduled_at for update skip locked loop
    select count(*) into v_n from public.kargora_draw_entries where draw_id = d.id;
    if v_n = 0 then
      update public.kargora_draws set status='no_entries', entries_count=0, drawn_at=now() where id = d.id;
    else
      select user_id into v_user from public.kargora_draw_entries where draw_id = d.id order by gen_random_uuid() limit 1;
      select coalesce(raw_user_meta_data->>'full_name',''), regexp_replace(coalesce(raw_user_meta_data->>'phone',''),'\D','','g')
        into v_name, v_phone from auth.users where id = v_user;
      v_disp := coalesce(nullif(left(v_name,1),''),'P') || '***' ||
                case when char_length(v_phone) >= 2 then ' (…' || right(v_phone,2) || ')' else '' end;
      update public.kargora_draws set status='drawn', entries_count=v_n, winner_user_id=v_user,
             winner_display=v_disp, drawn_at=now() where id = d.id;
    end if;
  end loop;
end $$;

create function public.kargora__ensure_draws() returns void
language plpgsql security definer set search_path = '' as $$
declare v_prize text; v_hours int[]; v_day date; v_h int; v_ts timestamptz; i int;
begin
  select nullif(btrim(value),'') into v_prize from public.kargora_settings where key = 'lottery_prize';
  if v_prize is null then return; end if;
  select string_to_array(coalesce((select value from public.kargora_settings where key = 'lottery_hours'),'6,10'), ',')::int[] into v_hours;
  for i in 0..13 loop
    v_day := ((now() at time zone 'Africa/Bangui')::date) + i;
    if extract(dow from v_day) = 6 then
      foreach v_h in array v_hours loop
        v_ts := (v_day + make_interval(hours => v_h)) at time zone 'Africa/Bangui';
        if v_ts > now() then
          insert into public.kargora_draws(scheduled_at, prize) values (v_ts, v_prize) on conflict (scheduled_at) do nothing;
        end if;
      end loop;
    end if;
  end loop;
end $$;

create function public.kargora_lottery_state() returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform public.kargora__run_due_draws();
  perform public.kargora__ensure_draws();
  return jsonb_build_object(
    'upcoming', (select coalesce(jsonb_agg(jsonb_build_object('id', d.id, 'scheduled_at', d.scheduled_at, 'prize', d.prize,
        'entries', (select count(*) from public.kargora_draw_entries e where e.draw_id = d.id),
        'entered', exists (select 1 from public.kargora_draw_entries e where e.draw_id = d.id and e.user_id = (select auth.uid())))
        order by d.scheduled_at), '[]'::jsonb)
      from (select * from public.kargora_draws where status = 'open' order by scheduled_at limit 4) d),
    'past', (select coalesce(jsonb_agg(jsonb_build_object('scheduled_at', p.scheduled_at, 'prize', p.prize, 'status', p.status,
        'winner', p.winner_display, 'entries', p.entries_count) order by p.scheduled_at desc), '[]'::jsonb)
      from (select * from public.kargora_draws where status in ('drawn','no_entries') order by scheduled_at desc limit 8) p),
    'won', (select coalesce(jsonb_agg(jsonb_build_object('scheduled_at', w.scheduled_at, 'prize', w.prize, 'prize_status', w.prize_status)
        order by w.scheduled_at desc), '[]'::jsonb)
      from public.kargora_draws w where w.winner_user_id = (select auth.uid())));
end $$;

create function public.kargora_lottery_enter(p_draw uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null then raise exception 'Connexion requise'; end if;
  perform public.kargora__run_due_draws();
  if not exists (select 1 from public.kargora_draws where id = p_draw and status = 'open' and scheduled_at > now()) then
    raise exception 'Ce tirage est clos';
  end if;
  insert into public.kargora_draw_entries(draw_id, user_id) values (p_draw, (select auth.uid())) on conflict do nothing;
end $$;

-- ---------- Administration ----------
create function public.kargora_admin_clients() returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if not public.kargora_is_admin() then raise exception 'Accès refusé'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object(
      'id', u.id, 'email', u.email, 'full_name', u.raw_user_meta_data->>'full_name', 'phone', u.raw_user_meta_data->>'phone',
      'account_type', u.raw_user_meta_data->>'account_type', 'created_at', u.created_at, 'last_sign_in_at', u.last_sign_in_at,
      'requests', (select count(*) from public.kargora_requests r where r.user_id = u.id)
    ) order by u.created_at desc), '[]'::jsonb)
    from auth.users u where u.raw_user_meta_data->>'app' = 'kargora');
end $$;

create function public.kargora_admin_draws() returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if not public.kargora_is_admin() then raise exception 'Accès refusé'; end if;
  perform public.kargora__run_due_draws();
  perform public.kargora__ensure_draws();
  return (select coalesce(jsonb_agg(jsonb_build_object(
      'id', d.id, 'scheduled_at', d.scheduled_at, 'prize', d.prize, 'status', d.status, 'entries', d.entries_count,
      'prize_status', d.prize_status, 'admin_note', d.admin_note, 'drawn_at', d.drawn_at,
      'winner_email', u.email, 'winner_name', u.raw_user_meta_data->>'full_name', 'winner_phone', u.raw_user_meta_data->>'phone',
      'live_entries', (select count(*) from public.kargora_draw_entries e where e.draw_id = d.id)
    ) order by d.scheduled_at desc), '[]'::jsonb)
    from (select * from public.kargora_draws order by scheduled_at desc limit 30) d
    left join auth.users u on u.id = d.winner_user_id);
end $$;

-- droits d'exécution
revoke execute on function public.kargora_my_requests(), public.kargora_my_request(text), public.kargora_my_respond(text,boolean),
  public.kargora_claim_request(text,text), public.kargora_my_summary(), public.kargora__run_due_draws(), public.kargora__ensure_draws(),
  public.kargora_lottery_state(), public.kargora_lottery_enter(uuid), public.kargora_admin_clients(), public.kargora_admin_draws()
  from public, anon, authenticated;
grant execute on function public.kargora_my_requests(), public.kargora_my_request(text), public.kargora_my_respond(text,boolean),
  public.kargora_claim_request(text,text), public.kargora_my_summary(), public.kargora_lottery_enter(uuid),
  public.kargora_admin_clients(), public.kargora_admin_draws() to authenticated;
grant execute on function public.kargora_lottery_state() to anon, authenticated;

-- ---------- Réglages de l'estimateur (renseignés par l'administrateur à partir de vrais devis partenaires) ----------
insert into public.kargora_settings(key,value) values
 ('fx_USD',''),('fx_EUR',''),('fx_CNY',''),('fx_AED',''),
 ('estimate_uplift_min_percent',''),('estimate_uplift_max_percent',''),
 ('wholesale_keywords',''),('wholesale_min_qty','')
on conflict (key) do nothing;
