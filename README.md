# KARGORA — Achats · Approvisionnement · Logistique

Site MVP (Next.js, pages router) + Supabase. Marché de lancement : Bangui.

## Démarrer
```
cp .env.example .env.local   # puis compléter les coordonnées de contact quand elles sont validées
npm install
npm run dev
```

## Supabase
Projet utilisé : `wkhvzgxprevlyzmirwkx` (partagé avec une autre application : toutes les tables KARGORA sont préfixées `kargora_`).
Schéma : `supabase/migrations/20261030_kargora_init.sql`.

- Le public n'accède **à aucune table** directement. Il passe par 4 fonctions : `kargora_submit_request`, `kargora_track`, `kargora_respond_quote`, `kargora_send_message`.
- L'administrateur (table `kargora_admins`) accède aux tables via RLS et aux fonctions `kargora_set_status`, `kargora_send_quote`, `kargora_create_order`, `kargora_record_payment`.
- Pièces jointes : bucket privé `kargora-uploads` (5 Mo, JPG/PNG/WebP/PDF).

### Créer le premier administrateur
1. Supabase → Authentication → Users → *Add user* (e-mail + mot de passe).
2. SQL editor : `insert into public.kargora_admins(user_id) select id from auth.users where email = 'VOTRE_EMAIL';`
3. Se connecter sur `/admin`.

### Instructions de paiement
À saisir dans `/admin` → « Instructions de paiement », seulement quand chaque moyen est validé. Elles ne sont montrées au client qu'après acceptation du devis.
