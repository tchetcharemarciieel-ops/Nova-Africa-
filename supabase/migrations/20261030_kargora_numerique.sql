-- Commandes numériques (Modèle A : achat à la demande, sur devis)
insert into public.kargora_statuses(code,label) values
 (15,'Opération en cours auprès de la plateforme'),
 (16,'Opération effectuée, confirmation envoyée');

alter table public.kargora_requests
  add column kind text not null default 'physique' check (kind in ('physique','numerique')),
  add column service text check (service is null or service in
    ('netflix','spotify','canva','playstation','apple','google_play','logiciel','domaine','carte_cadeau','jeu','paiement','autre')),
  add constraint kargora_requests_service_kind check ((kind = 'numerique') or service is null);
create index on public.kargora_requests (kind);

drop function public.kargora_submit_request(text,text,text,text,text,int,text,bigint,text,text[]);
create function public.kargora_submit_request(
  p_full_name text, p_phone text, p_profile text, p_description text, p_url text,
  p_quantity int, p_origin text, p_budget bigint, p_comment text, p_files text[],
  p_kind text default 'physique', p_service text default null
) returns text
language plpgsql security definer set search_path = '' as $$
declare v_number text; v_id uuid; v_f text;
begin
  if char_length(public.kargora_phone_key(p_phone)) < 8 then raise exception 'Numéro de téléphone invalide'; end if;
  foreach v_f in array coalesce(p_files, '{}') loop
    if v_f !~ '^requests/[0-9a-fA-F-]{36}/[A-Za-z0-9._-]{1,120}$' then raise exception 'Chemin de fichier invalide'; end if;
  end loop;
  if coalesce(array_length(p_files,1),0) > 5 then raise exception 'Trop de fichiers'; end if;
  v_number := 'KRG-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
  insert into public.kargora_requests(number, full_name, phone, profile, product_description, product_url,
    quantity, preferred_origin, budget_indicatif, comment, file_paths, kind, service)
  values (v_number, btrim(p_full_name), btrim(p_phone), p_profile, btrim(p_description), nullif(btrim(p_url),''),
    coalesce(p_quantity,1), nullif(btrim(p_origin),''), p_budget, nullif(btrim(p_comment),''), coalesce(p_files,'{}'),
    coalesce(p_kind,'physique'), case when p_kind = 'numerique' then p_service end)
  returning id into v_id;
  insert into public.kargora_status_history(request_id, status_code, public_note)
  values (v_id, 1, 'Votre demande a bien été reçue. Elle doit être étudiée ; ce n''est pas une commande payée.');
  return v_number;
end $$;
revoke execute on function public.kargora_submit_request(text,text,text,text,text,int,text,bigint,text,text[],text,text) from public, anon, authenticated;
grant execute on function public.kargora_submit_request(text,text,text,text,text,int,text,bigint,text,text[],text,text) to anon, authenticated;

-- le suivi expose le type de commande (create or replace conserve les droits)
create or replace function public.kargora_track(p_number text, p_phone text) returns jsonb
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
  return jsonb_build_object('number', r.number, 'kind', r.kind, 'service', r.service, 'status_code', r.status_code,
    'status', (select label from public.kargora_statuses where code = r.status_code),
    'note', r.public_note, 'created_at', r.created_at, 'product', r.product_description,
    'history', v_hist, 'quote', v_quote, 'payment_instructions', v_pay);
end $$;
