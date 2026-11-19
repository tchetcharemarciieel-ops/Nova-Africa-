export type Kind = "carburant" | "prix" | "coupure" | "alerte";
export type Ton = "ok" | "warn" | "bad";

export const KINDS: Record<Kind, {
  nom: string; court: string; couleur: string; lieuLabel: string; lieuAide: string; objets: string[];
  etats: [string, Ton][]; prix: "non" | "option" | "requis"; noteRequise: boolean; vide: string;
}> = {
  carburant: { nom: "Carburant", court: "Carburant", couleur: "#b7791f", lieuLabel: "Station ou quartier", lieuAide: "Ex. Station du marché de Bimbo",
    objets: ["Essence", "Gasoil", "Pétrole lampant", "Gaz"], etats: [["Disponible", "ok"], ["File longue", "warn"], ["Presque fini", "warn"], ["Vide", "bad"]],
    prix: "option", noteRequise: false, vide: "Aucun signalement de carburant depuis 24 h." },
  prix: { nom: "Prix du marché", court: "Prix", couleur: "#2b6cb0", lieuLabel: "Marché", lieuAide: "Ex. Marché Centre, PK5, Bégoua",
    objets: ["Riz (kg)", "Huile (litre)", "Manioc (tas)", "Sucre (kg)", "Poisson (kg)", "Viande (kg)", "Farine (kg)", "Oignon (tas)", "Tomate (tas)", "Autre"],
    etats: [["Relevé", "ok"], ["En hausse", "warn"], ["En baisse", "ok"]], prix: "requis", noteRequise: false, vide: "Aucun prix relevé depuis 7 jours." },
  coupure: { nom: "Coupures", court: "Coupures", couleur: "#6b46c1", lieuLabel: "Quartier", lieuAide: "Ex. Bégoua, Miskine",
    objets: ["Électricité", "Eau", "Internet", "Téléphone"], etats: [["Coupée", "bad"], ["Intermittente", "warn"], ["Revenue", "ok"]],
    prix: "non", noteRequise: false, vide: "Aucune coupure signalée depuis 24 h." },
  alerte: { nom: "Alertes", court: "Alertes", couleur: "#c53030", lieuLabel: "Lieu", lieuAide: "Ex. Route de Bimbo, pont de Sica",
    objets: ["Route", "Inondation", "Sécurité", "Événement", "Autre"], etats: [["Bloquée", "bad"], ["En cours", "warn"], ["Dégagée", "ok"]],
    prix: "non", noteRequise: true, vide: "Aucune alerte depuis 24 h." },
};
export const ORDRE: Kind[] = ["carburant", "prix", "coupure", "alerte"];
export const estKind = (k: string): k is Kind => k in KINDS;
export const QUARTIERS = ["Bangui centre", "Bimbo", "Bégoua", "PK5", "PK12", "Miskine", "Boy-Rabe", "Combattants", "Gobongo", "Fatima", "Lakouanga", "Ouango", "Sica"];

export function tonDe(kind: Kind, etat: string): Ton { return KINDS[kind].etats.find(e => e[0] === etat)?.[1] ?? "warn"; }
export function depuis(iso: string): string {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  if (m < 1440) return `il y a ${Math.round(m / 60)} h`;
  return `il y a ${Math.round(m / 1440)} j`;
}
export function fraicheur(kind: Kind, iso: string): "frais" | "recent" | "ancien" {
  const h = (Date.now() - new Date(iso).getTime()) / 3600000;
  const [a, b] = kind === "prix" ? [24, 72] : [1, 6];
  return h < a ? "frais" : h < b ? "recent" : "ancien";
}
export const fcfa = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;
export function dateDuJour(): string { return new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }); }
