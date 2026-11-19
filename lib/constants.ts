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

export const initiales = (nom: string) => nom.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join("") || "?";
const PALETTE = ["#0f4c3a", "#b8470a", "#7a3a12", "#1f6f8b", "#8a5a00", "#5a3d8a"];
export function couleur(nom: string): string { let h = 0; for (const ch of nom) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return PALETTE[h % PALETTE.length]; }
export function depuis(iso: string): string {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 60) return `il y a ${Math.max(m, 1)} min`;
  if (m < 1440) return `il y a ${Math.round(m / 60)} h`;
  return `il y a ${Math.round(m / 1440)} j`;
}
export function formatPhone(d: string): string {
  return d.startsWith("236") && d.length === 11 ? `+236 ${d.slice(3, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)} ${d.slice(9)}` : `+${d}`;
}
export function normalizePhone(raw: string): string | null {
  const d = raw.replace(/\D/g, "");
  if (d.length === 0) return null;
  if (d.length === 8) return "236" + d;
  return d.length >= 9 && d.length <= 15 ? d : "invalide";
}
export const NIVEAUX = [
  { n: 1, nom: "Profil créé" },
  { n: 2, nom: "Profil complet" },
  { n: 3, nom: "Identité vérifiée" },
  { n: 4, nom: "Entreprise déclarée" },
];
