-- KARGORA MVP : tables préfixées kargora_ (projet Supabase partagé : ne touche à aucune autre table)

create table public.kargora_statuses (
  code int primary key,
  label text not null
);
insert into public.kargora_statuses(code,label) values
 (1,'Demande reçue'),(2,'Vérification en cours'),(3,'Devis envoyé'),(4,'En attente de paiement'),
 (5,'Paiement confirmé'),(6,'Achat effectué'),(7,'Colis reçu chez le partenaire logistique'),
 (8,'En préparation d''expédition'),(9,'En transit'),(10,'Dédouanement en cours'),
 (11,'Arrivé à Bangui'),(12,'Disponible pour retrait'),(13,'Remis au client'),(14,'Annulé ou remboursé');

create table public.kargora_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create function public.kargora_is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.kargora_admins where user_id = (select auth.uid()));
$$;
revoke execute on function public.kargora_is_admin() from public, anon;
grant execute on function public.kargora_is_admin() to authenticated;

create table public.kargora_requests (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  full_name text not null check (char_length(full_name) between 2 and 120),
  phone text not null check (char_length(phone) between 6 and 30),
  profile text not null check (profile in ('particulier','commercant','entreprise')),
  product_description text not null check (char_length(product_description) between 3 and 2000),
  product_url text check (product_url is null or char_length(product_url) <= 1000),
  quantity int not null default 1 check (quantity > 0 and quantity <= 1000000),
  preferred_origin text check (preferred_origin is null or char_length(preferred_origin) <= 200),
  budget_indicatif bigint check (budget_indicatif is null or budget_indicatif >= 0),
  comment text check (comment is null or char_length(comment) <= 2000),
  file_paths text[] not null default '{}',
  category text,
  status_code int not null default 1 references public.kargora_statuses(code),
  public_note text,
  internal_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.kargora_requests (status_code);
create index on public.kargora_requests (phone);
create index on public.kargora_requests (created_at desc);

create table public.kargora_status_history (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.kargora_requests(id) on delete cascade,
  status_code int not null references public.kargora_statuses(code),
  public_note text,
  created_by uuid,
  created_at timestamptz not null default now()
);
create index on public.kargora_status_history (request_id, created_at);

create table public.kargora_quotes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.kargora_requests(id) on delete cascade,
  designation text not null,
  quantity int not null check (quantity > 0),
  purchase_price bigint not null default 0 check (purchase_price >= 0),
  transport_hub bigint not null default 0 check (transport_hub >= 0),
  transport_intl bigint not null default 0 check (transport_intl >= 0),
  insurance bigint not null default 0 check (insurance >= 0),
  customs_estimate bigint not null default 0 check (customs_estimate >= 0),
  local_fees bigint not null default 0 check (local_fees >= 0),
  service_fee bigint not null default 0 check (service_fee >= 0),
  total bigint generated always as (purchase_price + transport_hub + transport_intl + insurance + customs_estimate + local_fees + service_fee) stored,
  total_confirmed boolean not null default false,
  valid_until date not null,
  delivery_estimate text,
  conditions text,
  status text not null default 'draft' check (status in ('draft','sent','accepted','refused','expired')),
  created_by uuid,
  created_at timestamptz not null default now(),
  responded_at timestamptz
);
create index on public.kargora_quotes (request_id);

create table public.kargora_orders (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.kargora_requests(id) on delete restrict,
  quote_id uuid not null references public.kargora_quotes(id),
  billed_amount bigint not null check (billed_amount >= 0),
  cost_purchase bigint not null default 0,
  cost_transport bigint not null default 0,
  cost_customs bigint not null default 0,
  cost_other bigint not null default 0,
  created_at timestamptz not null default now()
);

create sequence public.kargora_receipt_seq;
create table public.kargora_payments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.kargora_requests(id) on delete restrict,
  method text not null check (method in ('orange_money','virement','especes')),
  amount bigint not null check (amount > 0),
  reference text,
  receipt_number text not null unique,
  note text,
  confirmed_by uuid not null,
  confirmed_at timestamptz not null default now()
);
create index on public.kargora_payments (request_id);

create table public.kargora_packages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.kargora_requests(id) on delete cascade,
  received_at timestamptz not null default now(),
  condition text,
  weight_kg numeric(10,2) check (weight_kg is null or weight_kg >= 0),
  tracking_number text,
  note text
);
create index on public.kargora_packages (request_id);

create table public.kargora_documents (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.kargora_requests(id) on delete cascade,
  kind text not null check (kind in ('justificatif','facture','recu','autre')),
  label text,
  path text not null,
  created_at timestamptz not null default now()
);
create index on public.kargora_documents (request_id);

create table public.kargora_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  phone text check (phone is null or char_length(phone) <= 30),
  email text check (email is null or char_length(email) <= 200),
  message text not null check (char_length(message) between 3 and 3000),
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.kargora_settings (
  key text primary key,
  value text not null
);
insert into public.kargora_settings(key,value) values
 ('payment_orange_money','Instructions Orange Money marchand : à renseigner après validation contractuelle.'),
 ('payment_virement','Coordonnées bancaires : à renseigner après ouverture du compte professionnel.'),
 ('payment_especes','Paiement en espèces au point de vente, avec reçu : à confirmer.');

-- RLS : tout est fermé ; seul l'administrateur lit/écrit en direct. Le public passe par les fonctions.
alter table public.kargora_statuses enable row level security;
alter table public.kargora_admins enable row level security;
alter table public.kargora_requests enable row level security;
alter table public.kargora_status_history enable row level security;
alter table public.kargora_quotes enable row level security;
alter table public.kargora_orders enable row level security;
alter table public.kargora_payments enable row level security;
alter table public.kargora_packages enable row level security;
alter table public.kargora_documents enable row level security;
alter table public.kargora_messages enable row level security;
alter table public.kargora_settings enable row level security;

create policy kargora_statuses_read on public.kargora_statuses for select to anon, authenticated using (true);

create policy kargora_admin_all on public.kargora_requests for all to authenticated
  using ((select public.kargora_is_admin())) with check ((select public.kargora_is_admin()));
create policy kargora_admin_all on public.kargora_status_history for all to authenticated
  using ((select public.kargora_is_admin())) with check ((select public.kargora_is_admin()));
create policy kargora_admin_all on public.kargora_quotes for all to authenticated
  using ((select public.kargora_is_admin())) with check ((select public.kargora_is_admin()));
create policy kargora_admin_all on public.kargora_orders for all to authenticated
  using ((select public.kargora_is_admin())) with check ((select public.kargora_is_admin()));
create policy kargora_admin_all on public.kargora_packages for all to authenticated
  using ((select public.kargora_is_admin())) with check ((select public.kargora_is_admin()));
create policy kargora_admin_all on public.kargora_documents for all to authenticated
  using ((select public.kargora_is_admin())) with check ((select public.kargora_is_admin()));
create policy kargora_admin_all on public.kargora_messages for all to authenticated
  using ((select public.kargora_is_admin())) with check ((select public.kargora_is_admin()));
create policy kargora_admin_all on public.kargora_settings for all to authenticated
  using ((select public.kargora_is_admin())) with check ((select public.kargora_is_admin()));
-- paiements : lecture seule en direct ; l'enregistrement passe par kargora_record_payment
create policy kargora_admin_read on public.kargora_payments for select to authenticated
  using ((select public.kargora_is_admin()));

-- ---------- Fonctions publiques ----------
create function public.kargora_phone_key(p text) returns text
language sql immutable set search_path = '' as $$
  select right(regexp_replace(coalesce(p,''), '\D', '', 'g'), 8);
$$;

create function public.kargora_submit_request(
  p_full_name text, p_phone text, p_profile text, p_description text, p_url text,
  p_quantity int, p_origin text, p_budget bigint, p_comment text, p_files text[]
) returns text
language plpgsql security definer set search_path = '' as $$
declare v_number text; v_id uuid; v_f text;
begin
  if char_length(public.kargora_phone_key(p_phone)) < 8 then
    raise exception 'Numéro de téléphone invalide';
  end if;
  foreach v_f in array coalesce(p_files, '{}') loop
    if v_f !~ '^requests/[0-9a-fA-F-]{36}/[A-Za-z0-9._-]{1,120}$' then
      raise exception 'Chemin de fichier invalide';
    end if;
  end loop;
  if coalesce(array_length(p_files,1),0) > 5 then raise exception 'Trop de fichiers'; end if;
  v_number := 'KRG-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
  insert into public.kargora_requests(number, full_name, phone, profile, product_description, product_url,
    quantity, preferred_origin, budget_indicatif, comment, file_paths)
  values (v_number, btrim(p_full_name), btrim(p_phone), p_profile, btrim(p_description), nullif(btrim(p_url),''),
    coalesce(p_quantity,1), nullif(btrim(p_origin),''), p_budget, nullif(btrim(p_comment),''), coalesce(p_files,'{}'))
  returning id into v_id;
  insert into public.kargora_status_history(request_id, status_code, public_note)
  values (v_id, 1, 'Votre demande a bien été reçue. Elle doit être étudiée ; ce n''est pas une commande payée.');
  return v_number;
end $$;

create function public.kargora_send_message(p_name text, p_phone text, p_email text, p_message text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into public.kargora_messages(full_name, phone, email, message)
  values (btrim(p_name), nullif(btrim(p_phone),''), nullif(btrim(p_email),''), btrim(p_message));
end $$;

create function public.kargora_track(p_number text, p_phone text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare r public.kargora_requests; q public.kargora_quotes; v_hist jsonb; v_quote jsonb; v_pay jsonb;
begin
  select * into r from public.kargora_requests
   where number = upper(btrim(p_number)) and public.kargora_phone_key(phone) = public.kargora_phone_key(p_phone);
  if not found then return null; end if;
  select coalesce(jsonb_agg(jsonb_build_object('status', s.label, 'note', h.public_note, 'at', h.created_at) order by h.created_at), '[]')
    into v_hist from public.kargora_status_history h join public.kargora_statuses s on s.code = h.status_code
   where h.request_id = r.id;
  select * into q from public.kargora_quotes
   where request_id = r.id and status in ('sent','accepted','refused','expired') order by created_at desc limit 1;
  if found then
    v_quote := jsonb_build_object('id', q.id, 'designation', q.designation, 'quantity', q.quantity,
      'purchase_price', q.purchase_price, 'transport_hub', q.transport_hub, 'transport_intl', q.transport_intl,
      'insurance', q.insurance, 'customs_estimate', q.customs_estimate, 'local_fees', q.local_fees,
      'service_fee', q.service_fee, 'total', q.total, 'total_confirmed', q.total_confirmed,
      'valid_until', q.valid_until, 'delivery_estimate', q.delivery_estimate, 'conditions', q.conditions,
      'status', case when q.status = 'sent' and q.valid_until < current_date then 'expired' else q.status end);
    if q.status = 'accepted' then
      select jsonb_object_agg(key, value) into v_pay from public.kargora_settings where key like 'payment\_%';
    end if;
  end if;
  return jsonb_build_object('number', r.number, 'status_code', r.status_code,
    'status', (select label from public.kargora_statuses where code = r.status_code),
    'note', r.public_note, 'created_at', r.created_at, 'product', r.product_description,
    'history', v_hist, 'quote', v_quote, 'payment_instructions', v_pay);
end $$;

create function public.kargora_respond_quote(p_number text, p_phone text, p_accept boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare r public.kargora_requests; q public.kargora_quotes;
begin
  select * into r from public.kargora_requests
   where number = upper(btrim(p_number)) and public.kargora_phone_key(phone) = public.kargora_phone_key(p_phone);
  if not found then raise exception 'Demande introuvable'; end if;
  select * into q from public.kargora_quotes where request_id = r.id and status = 'sent'
   order by created_at desc limit 1;
  if not found then raise exception 'Aucun devis en attente de réponse'; end if;
  if q.valid_until < current_date then raise exception 'Ce devis a expiré, contactez-nous pour une mise à jour'; end if;
  if p_accept then
    update public.kargora_quotes set status='accepted', responded_at=now() where id = q.id;
    update public.kargora_requests set status_code=4, public_note='Devis accepté. Les instructions de paiement sont affichées ci-dessous.', updated_at=now() where id=r.id;
    insert into public.kargora_status_history(request_id,status_code,public_note) values (r.id,4,'Devis accepté par le client.');
  else
    update public.kargora_quotes set status='refused', responded_at=now() where id = q.id;
    update public.kargora_requests set status_code=14, public_note='Devis refusé. Aucune commande lancée.', updated_at=now() where id=r.id;
    insert into public.kargora_status_history(request_id,status_code,public_note) values (r.id,14,'Devis refusé par le client. Aucune commande lancée.');
  end if;
  return public.kargora_track(p_number, p_phone);
end $$;

-- ---------- Fonctions administrateur ----------
create function public.kargora_set_status(p_request_id uuid, p_status int, p_public_note text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.kargora_is_admin() then raise exception 'Accès refusé'; end if;
  update public.kargora_requests set status_code=p_status, public_note=nullif(btrim(p_public_note),''), updated_at=now() where id=p_request_id;
  if not found then raise exception 'Demande introuvable'; end if;
  insert into public.kargora_status_history(request_id,status_code,public_note,created_by)
  values (p_request_id,p_status,nullif(btrim(p_public_note),''),(select auth.uid()));
end $$;

create function public.kargora_send_quote(p_quote_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_req uuid;
begin
  if not public.kargora_is_admin() then raise exception 'Accès refusé'; end if;
  update public.kargora_quotes set status='sent' where id=p_quote_id and status='draft' returning request_id into v_req;
  if not found then raise exception 'Devis introuvable ou déjà envoyé'; end if;
  perform public.kargora_set_status(v_req, 3, 'Votre devis est prêt. Consultez-le et acceptez-le ou refusez-le.');
end $$;

create function public.kargora_create_order(p_request_id uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare q public.kargora_quotes; v_id uuid;
begin
  if not public.kargora_is_admin() then raise exception 'Accès refusé'; end if;
  select * into q from public.kargora_quotes where request_id=p_request_id and status='accepted' order by created_at desc limit 1;
  if not found then raise exception 'Aucun devis accepté : commande impossible sans validation explicite du client'; end if;
  insert into public.kargora_orders(request_id, quote_id, billed_amount) values (p_request_id, q.id, q.total)
  returning id into v_id;
  return v_id;
end $$;

create function public.kargora_record_payment(p_request_id uuid, p_method text, p_amount bigint, p_reference text, p_note text)
returns text language plpgsql security definer set search_path = '' as $$
declare v_receipt text;
begin
  if not public.kargora_is_admin() then raise exception 'Accès refusé'; end if;
  if not exists (select 1 from public.kargora_orders where request_id = p_request_id) then
    raise exception 'Créez d''abord la commande (devis accepté requis)';
  end if;
  v_receipt := 'REC-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.kargora_receipt_seq')::text, 5, '0');
  insert into public.kargora_payments(request_id, method, amount, reference, receipt_number, note, confirmed_by)
  values (p_request_id, p_method, p_amount, nullif(btrim(p_reference),''), v_receipt, nullif(btrim(p_note),''), (select auth.uid()));
  perform public.kargora_set_status(p_request_id, 5, 'Paiement confirmé. Reçu ' || v_receipt || '.');
  return v_receipt;
end $$;

-- Droits d'exécution : uniquement sur les fonctions kargora_*
revoke execute on function public.kargora_phone_key(text) from public, anon, authenticated;
revoke execute on function public.kargora_submit_request(text,text,text,text,text,int,text,bigint,text,text[]) from public, anon, authenticated;
revoke execute on function public.kargora_send_message(text,text,text,text) from public, anon, authenticated;
revoke execute on function public.kargora_track(text,text) from public, anon, authenticated;
revoke execute on function public.kargora_respond_quote(text,text,boolean) from public, anon, authenticated;
revoke execute on function public.kargora_set_status(uuid,int,text) from public, anon, authenticated;
revoke execute on function public.kargora_send_quote(uuid) from public, anon, authenticated;
revoke execute on function public.kargora_create_order(uuid) from public, anon, authenticated;
revoke execute on function public.kargora_record_payment(uuid,text,bigint,text,text) from public, anon, authenticated;

grant execute on function public.kargora_submit_request(text,text,text,text,text,int,text,bigint,text,text[]) to anon, authenticated;
grant execute on function public.kargora_send_message(text,text,text,text) to anon, authenticated;
grant execute on function public.kargora_track(text,text) to anon, authenticated;
grant execute on function public.kargora_respond_quote(text,text,boolean) to anon, authenticated;
grant execute on function public.kargora_set_status(uuid,int,text) to authenticated;
grant execute on function public.kargora_send_quote(uuid) to authenticated;
grant execute on function public.kargora_create_order(uuid) to authenticated;
grant execute on function public.kargora_record_payment(uuid,text,bigint,text,text) to authenticated;

-- Stockage privé des pièces jointes (5 Mo, images/PDF)
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('kargora-uploads','kargora-uploads', false, 5242880, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;
create policy kargora_uploads_insert on storage.objects for insert to anon, authenticated
  with check (bucket_id='kargora-uploads' and (storage.foldername(name))[1]='requests');
create policy kargora_uploads_admin_read on storage.objects for select to authenticated
  using (bucket_id='kargora-uploads' and (select public.kargora_is_admin()));
create policy kargora_uploads_admin_write on storage.objects for all to authenticated
  using (bucket_id='kargora-uploads' and (select public.kargora_is_admin()))
  with check (bucket_id='kargora-uploads' and (select public.kargora_is_admin()));

-- Indicateurs (admin uniquement grâce à security_invoker + RLS)
create view public.kargora_kpis with (security_invoker = true) as
select
  (select count(*) from public.kargora_requests) as requests_total,
  (select count(*) from public.kargora_requests where profile in ('commercant','entreprise')) as requests_pro,
  (select count(*) from public.kargora_quotes where status in ('sent','accepted','refused','expired')) as quotes_sent,
  (select count(*) from public.kargora_quotes where status = 'accepted') as quotes_accepted,
  (select count(distinct request_id) from public.kargora_payments) as orders_paid,
  (select coalesce(sum(amount),0) from public.kargora_payments) as sales_total,
  (select coalesce(sum(o.cost_purchase+o.cost_transport+o.cost_customs+o.cost_other),0)
     from public.kargora_orders o where exists (select 1 from public.kargora_payments p where p.request_id=o.request_id)) as costs_total,
  (select count(*) from (select phone_key from (select public.kargora_phone_key(phone) phone_key, count(*) c
     from public.kargora_requests group by 1) t where c > 1) x) as repeat_customers;
revoke all on public.kargora_kpis from anon;
