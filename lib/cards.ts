// Carte pro : types, listes et stockage. Version de démonstration : les cartes sont gardées dans le navigateur
// (localStorage). Le stockage partagé (base de données) viendra après validation du plan, voir supabase/reseau-pro.sql.

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

export type Card = {
  slug: string;
  nom: string;
  metier: string;
  lieu: string;
  telephone: string; // chiffres seulement, avec l'indicatif, ex. 23670123456
  apropos: string;
  langues: string[];
  creeLe: string;
};

const KEY = "reseau-pro.cards";

/** Garde les chiffres. 8 chiffres : numéro centrafricain (+236). Sinon 9 à 15 chiffres avec indicatif. */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 8) return "236" + digits;
  if (digits.length >= 9 && digits.length <= 15) return digits;
  return null;
}

export function slugify(nom: string): string {
  const base = nom.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30);
  return `${base || "pro"}-${Math.random().toString(36).slice(2, 6)}`;
}

export function readCards(): Card[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch { return []; }
}

export function saveCard(card: Card): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify([card, ...readCards()].slice(0, 200)));
    return true;
  } catch { return false; }
}

export function findCard(slug: string): Card | undefined {
  return readCards().find(c => c.slug === slug);
}

export function formatPhone(digits: string): string {
  return digits.startsWith("236") && digits.length === 11
    ? `+236 ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`
    : `+${digits}`;
}
