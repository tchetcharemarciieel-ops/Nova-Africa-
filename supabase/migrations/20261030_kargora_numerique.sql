-- Appliquée sous le nom kargora_numerique_v2. Commandes numériques (Modèle A : achat à la demande, sur devis).
insert into public.kargora_statuses(code,label) values
 (15,'Opération en cours auprès de la plateforme'),
 (16,'Opération effectuée, confirmation envoyée');

alter table public.kargora_requests
  add column kind text not null default 'physique' check (kind in ('physique','numerique')),
  add column service text check (service is null or service in
    ('netflix','spotify','canva','playstation','apple','google_play','logiciel','domaine','carte_cadeau','jeu','paiement','autre')),
  add constraint kargora_requests_service_kind check ((kind = 'numerique') or service is null);
create index on public.kargora_requests (kind);

create function public.kargora_submit_digital_request(
  p_full_name text, p_phone text, p_profile text, p_service text,
  p_description text, p_quantity int, p_budget bigint
) returns text
language plpgsql security definer set search_path = '' as $$
declare v_number text; v_id uuid;
begin
  if char_length(public.kargora_phone_key(p_phone)) < 8 then raise exception 'Numéro de téléphone invalide'; end if;
  v_number := 'KRG-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
  insert into public.kargora_requests(number, full_name, phone, profile, product_description,
    quantity, budget_indicatif, kind, service)
  values (v_number, btrim(p_full_name), btrim(p_phone), p_profile, btrim(p_description),
    coalesce(p_quantity,1), p_budget, 'numerique', p_service)
  returning id into v_id;
  insert into public.kargora_status_history(request_id, status_code, public_note)
  values (v_id, 1, 'Votre demande a bien été reçue. Elle doit être étudiée ; ce n''est pas une commande payée.');
  return v_number;
end $$;
revoke execute on function public.kargora_submit_digital_request(text,text,text,text,text,int,bigint) from public, anon, authenticated;
grant execute on function public.kargora_submit_digital_request(text,text,text,text,text,int,bigint) to anon, authenticated;
-- + kargora_track mis à jour (ajoute kind et service au résultat) : voir l'historique des migrations Supabase.
