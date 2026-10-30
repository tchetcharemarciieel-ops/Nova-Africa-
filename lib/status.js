import { SERVICE_NAME } from "./services";
// Les 14 statuts physiques + 2 statuts propres au numérique (15, 16).
export const STEPS_PHYSICAL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
export const STEPS_DIGITAL = [1, 2, 3, 4, 5, 15, 16];
export function progress(kind, code) {
  const steps = kind === "numerique" ? STEPS_DIGITAL : STEPS_PHYSICAL;
  const idx = steps.indexOf(code);
  return { total: steps.length, done: idx < 0 ? 0 : idx + 1, cancelled: code === 14 };
}
export const kindLabel = (r) => (r.kind === "numerique" ? `Service numérique${r.service ? " · " + (SERVICE_NAME[r.service] || "") : ""}` : "Achat international");
export const groupByDay = (rows, key = "updated_at") => {
  const g = {};
  rows.forEach((r) => { const d = new Date(r[key]).toLocaleDateString("fr-FR", { dateStyle: "long" }); (g[d] = g[d] || []).push(r); });
  return Object.entries(g);
};
