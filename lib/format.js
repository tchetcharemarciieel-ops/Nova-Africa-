export const fcfa = (n) =>
  new Intl.NumberFormat("fr-FR").format(Number(n || 0)) + " FCFA";

export const dateFr = (d) =>
  d ? new Date(d).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" }) : "";

export const dayFr = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { dateStyle: "medium" }) : "";

export const PROFILES = { particulier: "Particulier", commercant: "Commerçant", entreprise: "Entreprise" };
export const METHODS = { orange_money: "Orange Money marchand", virement: "Virement bancaire", especes: "Espèces (point de vente)" };

export const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
