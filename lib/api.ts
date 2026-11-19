// Accès à la base du réseau pro par des fonctions (RPC). Aucune table n'est lisible directement.
const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CLE = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export class ApiError extends Error { code: string; constructor(code: string) { super(code); this.code = code; } }

export const MESSAGES_ERREUR: Record<string, string> = {
  RP_NOM: "Écris ton nom (au moins 2 lettres).",
  RP_LIMITE: "Tu as atteint la limite pour le moment. Réessaie plus tard.",
  RP_AUTH: "Ton identité n'est pas reconnue sur ce téléphone.",
  RP_INVITE: "Ce lien de confirmation n'est plus valable.",
  RP_DEJA: "Tu as déjà une carte.",
  RP_TEXTE: "Écris un message (1000 lettres au plus).",
  RP_DEST: "Tu ne peux pas écrire à cette personne.",
  RP_TEL: "Ce numéro n'est pas valide.",
  RP_CONV: "Cette conversation n'existe pas.",
  RESEAU: "Connexion impossible. Vérifie ta connexion et réessaie.",
  CONFIG: "L'application n'est pas configurée.",
};
export const messageErreur = (e: unknown) => (e instanceof ApiError ? MESSAGES_ERREUR[e.code] : undefined) ?? "Une erreur est survenue. Réessaie.";

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  if (!URL_BASE || !CLE) throw new ApiError("CONFIG");
  let res: Response;
  try {
    res = await fetch(`${URL_BASE}/rest/v1/rpc/${fn}`, { method: "POST", headers: { apikey: CLE, "Content-Type": "application/json" }, body: JSON.stringify(args) });
  } catch { throw new ApiError("RESEAU"); }
  if (!res.ok) {
    let msg = "ERREUR";
    try { const j = await res.json(); if (typeof j?.message === "string") msg = j.message; } catch { /* ignore */ }
    throw new ApiError(msg);
  }
  const txt = await res.text();
  return (txt ? JSON.parse(txt) : null) as T;
}

export type Me = { member_id: string; nom: string; slug: string | null };
export type Avis = { note: number; avis: string; prenom: string; travail: string; cree_le: string };
export type Profil = { slug: string; member_id: string; nom: string; metier: string; lieu: string; apropos: string; langues: string[]; telephone: string | null; chantiers: number; moyenne: number; niveau: 1 | 2; avis: Avis[]; cree_le: string };
export type Resume = { slug: string; nom: string; metier: string; lieu: string; chantiers: number; niveau: 1 | 2 };
export type Besoin = { id: string; member_id: string; nom: string; titre: string; metier: string; lieu: string; details: string; cree_le: string };
export type Offre = { id: string; member_id: string; titre: string; organisation: string; lieu: string; type: string; details: string; cree_le: string };
export type Conversation = { conversation_id: string; autre_id: string; autre_nom: string; derniere: string; apercu: string | null; non_lus: number };
export type Message = { id: string; moi: boolean; texte: string; cree_le: string };
export type Fil = { autre_id: string; autre_nom: string; messages: Message[] };

export const api = {
  register: (nom: string, secret: string) => rpc<string>("rp_register", { p_nom: nom, p_secret: secret }),
  me: (secret: string) => rpc<Me | null>("rp_me", { p_secret: secret }),
  createProfile: (secret: string, nom: string, metier: string, lieu: string, apropos: string, langues: string[], telephone: string | null) =>
    rpc<string>("rp_create_profile", { p_secret: secret, p_nom: nom, p_metier: metier, p_lieu: lieu, p_apropos: apropos, p_langues: langues, p_telephone: telephone }),
  getProfile: (slug: string) => rpc<Profil | null>("rp_get_profile", { p_slug: slug }),
  search: (metier: string, lieu: string, limit = 30) => rpc<Resume[]>("rp_search_profiles", { p_metier: metier, p_lieu: lieu, p_limit: limit }),
  createInvite: (secret: string) => rpc<string>("rp_create_invite", { p_secret: secret }),
  inviteInfo: (code: string) => rpc<{ nom: string; metier: string } | null>("rp_invite_info", { p_code: code }),
  confirm: (code: string, travail: string, note: number, avis: string, prenom: string) =>
    rpc<string>("rp_confirm", { p_code: code, p_travail: travail, p_note: note, p_avis: avis, p_prenom: prenom }),
  postNeed: (secret: string, titre: string, metier: string, lieu: string, details: string) =>
    rpc<string>("rp_post_need", { p_secret: secret, p_titre: titre, p_metier: metier, p_lieu: lieu, p_details: details }),
  listNeeds: (limit = 30) => rpc<Besoin[]>("rp_list_needs", { p_limit: limit }),
  postJob: (secret: string, titre: string, organisation: string, lieu: string, type: string, details: string) =>
    rpc<string>("rp_post_job", { p_secret: secret, p_titre: titre, p_organisation: organisation, p_lieu: lieu, p_type: type, p_details: details }),
  listJobs: (limit = 30) => rpc<Offre[]>("rp_list_jobs", { p_limit: limit }),
  send: (secret: string, to: string, texte: string) => rpc<string>("rp_send_message", { p_secret: secret, p_to: to, p_texte: texte }),
  inbox: (secret: string) => rpc<Conversation[]>("rp_inbox", { p_secret: secret }),
  thread: (secret: string, conversation: string) => rpc<Fil>("rp_thread", { p_secret: secret, p_conversation: conversation }),
  unread: (secret: string) => rpc<number>("rp_unread", { p_secret: secret }),
};
