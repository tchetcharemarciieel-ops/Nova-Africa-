// Données de la version de test : tout est gardé dans le navigateur (localStorage).
// Le stockage partagé (base de données) viendra après validation, voir supabase/reseau-pro.sql.

export const METIERS = [
  "Plomberie", "Électricité", "Menuiserie", "Maçonnerie", "Peinture", "Mécanique auto", "Couture et mode",
  "Coiffure et beauté", "Informatique", "Photo et vidéo", "Livraison et moto", "Cuisine et traiteur",
  "Cours et formation", "Comptabilité et gestion", "Autre",
] as const;
export const LIEUX = [
  "Bangui centre", "Bimbo", "Bégoua", "PK5", "PK12", "Miskine", "Boy-Rabe", "Combattants", "Gobongo",
  "Fatima", "Lakouanga", "Ouango", "Sica", "Autre quartier de Bangui", "Ailleurs en Centrafrique", "À l'étranger",
] as const;
export const LANGUES = ["Français", "Sango", "Anglais"] as const;
export const TYPES_OFFRE = ["CDI", "CDD", "Stage", "Mission"] as const;

export type Card = { slug: string; nom: string; metier: string; lieu: string; telephone: string; apropos: string; langues: string[]; creeLe: string };
export type Confirmation = { id: string; slug: string; travail: string; note: number; avis: string; prenom: string; creeLe: string };
export type Besoin = { id: string; titre: string; metier: string; lieu: string; details: string; telephone: string; creeLe: string };
export type Offre = { id: string; titre: string; organisation: string; lieu: string; type: string; details: string; telephone: string; creeLe: string };

const K = { cards: "reseau-pro.cards", conf: "reseau-pro.confirmations", besoins: "reseau-pro.besoins", offres: "reseau-pro.offres", moi: "reseau-pro.moi" };

function read<T>(key: string): T[] {
  try { const v = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(v) ? v : []; } catch { return []; }
}
function add<T>(key: string, item: T, max = 200): boolean {
  try { localStorage.setItem(key, JSON.stringify([item, ...read<T>(key)].slice(0, max))); return true; } catch { return false; }
}
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const readCards = () => read<Card>(K.cards);
export const findCard = (slug: string) => readCards().find(c => c.slug === slug);
export function saveCard(c: Card): boolean {
  const ok = add(K.cards, c);
  try { if (ok) localStorage.setItem(K.moi, c.slug); } catch { /* ignore */ }
  return ok;
}
export const maCarte = (): string | null => { try { return localStorage.getItem(K.moi); } catch { return null; } };

export const readConfirmations = (slug?: string) => read<Confirmation>(K.conf).filter(c => !slug || c.slug === slug);
export const saveConfirmation = (c: Confirmation) => add(K.conf, c, 500);
export const readBesoins = () => read<Besoin>(K.besoins);
export const saveBesoin = (b: Besoin) => add(K.besoins, b, 100);
export const readOffres = () => read<Offre>(K.offres);
export const saveOffre = (o: Offre) => add(K.offres, o, 100);

export function normalizePhone(raw: string): string | null {
  const d = raw.replace(/\D/g, "");
  if (d.length === 8) return "236" + d;
  if (d.length >= 9 && d.length <= 15) return d;
  return null;
}
export function formatPhone(d: string): string {
  return d.startsWith("236") && d.length === 11 ? `+236 ${d.slice(3, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)} ${d.slice(9)}` : `+${d}`;
}
export function slugify(nom: string): string {
  const base = nom.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30);
  return `${base || "pro"}-${Math.random().toString(36).slice(2, 6)}`;
}
export const initiales = (nom: string) => nom.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join("") || "?";
const PALETTE = ["#0f4c3a", "#e8590c", "#7a3a12", "#1f6f8b", "#8a5a00", "#5a3d8a"];
export function couleur(nom: string): string { let h = 0; for (const ch of nom) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return PALETTE[h % PALETTE.length]; }
export const waLien = (tel: string, texte?: string) => `https://wa.me/${tel}${texte ? `?text=${encodeURIComponent(texte)}` : ""}`;
export function depuis(iso: string): string {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 60) return `il y a ${Math.max(m, 1)} min`;
  if (m < 1440) return `il y a ${Math.round(m / 60)} h`;
  return `il y a ${Math.round(m / 1440)} j`;
}

/** Niveaux honnêtes : seuls les deux premiers existent aujourd'hui. */
export function niveau(c: Card): 1 | 2 { return c.apropos.length >= 20 ? 2 : 1; }
export const NIVEAUX = [
  { n: 1, nom: "Profil créé", dispo: true },
  { n: 2, nom: "Profil complet", dispo: true },
  { n: 3, nom: "Identité vérifiée", dispo: false },
  { n: 4, nom: "Entreprise déclarée", dispo: false },
];
export function stats(slug: string) {
  const l = readConfirmations(slug);
  const moyenne = l.length ? Math.round((l.reduce((s, c) => s + c.note, 0) / l.length) * 10) / 10 : 0;
  return { chantiers: l.length, moyenne, avis: l.filter(c => c.avis.trim()) };
}
