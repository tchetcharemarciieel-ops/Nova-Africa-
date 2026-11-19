import type { Kind } from "./constants";
const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CLE = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export class ApiError extends Error { code: string; constructor(code: string) { super(code); this.code = code; } }
export const MESSAGES_ERREUR: Record<string, string> = {
  BA_NOM: "Écris ton prénom (2 lettres au moins).",
  BA_LIMITE: "Tu as fait beaucoup de signalements. Réessaie dans une heure.",
  BA_AUTH: "Ton identité n'est pas reconnue sur ce téléphone.",
  BA_PROPRE: "Tu ne peux pas voter sur ton propre signalement.",
  BA_INTROUVABLE: "Ce signalement n'existe plus.",
  RESEAU: "Connexion impossible. Vérifie ta connexion et réessaie.",
  CONFIG: "L'application n'est pas configurée.",
};
export const messageErreur = (e: unknown) => (e instanceof ApiError ? MESSAGES_ERREUR[e.code] : undefined) ?? "Une erreur est survenue. Réessaie.";

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  if (!URL_BASE || !CLE) throw new ApiError("CONFIG");
  let res: Response;
  try { res = await fetch(`${URL_BASE}/rest/v1/rpc/${fn}`, { method: "POST", headers: { apikey: CLE, "Content-Type": "application/json" }, body: JSON.stringify(args) }); }
  catch { throw new ApiError("RESEAU"); }
  if (!res.ok) {
    let msg = "ERREUR";
    try { const j = await res.json(); if (typeof j?.message === "string") msg = j.message; } catch { /* ignore */ }
    throw new ApiError(msg);
  }
  const txt = await res.text();
  return (txt ? JSON.parse(txt) : null) as T;
}

export type Signalement = { id: string; kind: Kind; lieu: string; objet: string; etat: string; valeur: number | null; note: string; par: string; cree_le: string; oui: number; non: number };
export type Resume = Record<Kind, { n: number; derniere: string | null }>;
export type Moi = { id: string; nom: string };

export const api = {
  register: (nom: string, secret: string) => rpc<string>("ba_register", { p_nom: nom, p_secret: secret }),
  me: (secret: string) => rpc<Moi | null>("ba_me", { p_secret: secret }),
  report: (secret: string, kind: Kind, lieu: string, objet: string, etat: string, valeur: number | null, note: string) =>
    rpc<string>("ba_report", { p_secret: secret, p_kind: kind, p_lieu: lieu, p_objet: objet, p_etat: etat, p_valeur: valeur, p_note: note }),
  list: (kind: Kind, lieu: string, limit = 60) => rpc<Signalement[]>("ba_list", { p_kind: kind, p_lieu: lieu, p_limit: limit }),
  vote: (secret: string, report: string, ok: boolean) => rpc<null>("ba_vote", { p_secret: secret, p_report: report, p_ok: ok }),
  summary: () => rpc<Resume>("ba_summary", {}),
};
