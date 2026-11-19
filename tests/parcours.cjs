// Parcours complet avec un faux serveur (mêmes fonctions et mêmes paramètres que la base).
// NEXT_PUBLIC_SUPABASE_URL=https://mock.test NEXT_PUBLIC_SUPABASE_ANON_KEY=x npm run build && npx next start -p 3100, puis node tests/parcours.cjs
const { chromium } = require("playwright");
const U = "http://localhost:3100", SHOT = process.env.SHOT_DIR || "/tmp";
const SCHEMA = { ba_register: ["p_nom", "p_secret"], ba_me: ["p_secret"], ba_report: ["p_secret", "p_kind", "p_lieu", "p_objet", "p_etat", "p_valeur", "p_note"], ba_list: ["p_kind", "p_lieu", "p_limit"], ba_vote: ["p_secret", "p_report", "p_ok"], ba_summary: [] };
const db = { rep: [], reports: [], votes: [] };
const hex = n => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
const uuid = () => `${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`;
let tick = 0; const now = () => new Date(Date.now() + (tick++)).toISOString();
const fail = m => { const e = new Error(m); e.ba = m; throw e; };
const need = s => db.rep.find(x => x.secret === s) || fail("BA_AUTH");
const fns = {
  ba_register: a => { if (a.p_nom.trim().length < 2) fail("BA_NOM"); const r = { id: uuid(), nom: a.p_nom.trim(), secret: a.p_secret }; db.rep.push(r); return r.id; },
  ba_me: a => { const r = db.rep.find(x => x.secret === a.p_secret); return r ? { id: r.id, nom: r.nom } : null; },
  ba_report: a => { const r = need(a.p_secret); if (!["carburant", "prix", "coupure", "alerte"].includes(a.p_kind)) fail("CHECK"); const x = { id: uuid(), by: r.id, nom: r.nom, kind: a.p_kind, lieu: a.p_lieu, objet: a.p_objet, etat: a.p_etat, valeur: a.p_valeur, note: a.p_note, cree_le: now() }; db.reports.push(x); return x.id; },
  ba_list: a => { const m = new Map(); for (const x of db.reports.filter(x => x.kind === a.p_kind && (!a.p_lieu || x.lieu === a.p_lieu))) m.set(x.lieu + "|" + x.objet, x); return [...m.values()].reverse().map(x => ({ id: x.id, kind: x.kind, lieu: x.lieu, objet: x.objet, etat: x.etat, valeur: x.valeur, note: x.note, par: x.nom, cree_le: x.cree_le, oui: db.votes.filter(v => v.rid === x.id && v.ok).length, non: db.votes.filter(v => v.rid === x.id && !v.ok).length })); },
  ba_vote: a => { const r = need(a.p_secret); const x = db.reports.find(y => y.id === a.p_report) || fail("BA_INTROUVABLE"); if (x.by === r.id) fail("BA_PROPRE"); db.votes = db.votes.filter(v => !(v.rid === x.id && v.by === r.id)); db.votes.push({ rid: x.id, by: r.id, ok: a.p_ok }); return null; },
  ba_summary: () => Object.fromEntries(["carburant", "prix", "coupure", "alerte"].map(k => { const l = new Set(db.reports.filter(x => x.kind === k).map(x => x.lieu + x.objet)); const last = db.reports.filter(x => x.kind === k).slice(-1)[0]; return [k, { n: l.size, derniere: last ? last.cree_le : null }]; })),
};
async function brancher(ctx, log) {
  await ctx.route("https://mock.test/**", async route => {
    const req = route.request(); const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "POST, OPTIONS" };
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
    const fn = req.url().split("/rpc/")[1]; const args = JSON.parse(req.postData() || "{}");
    if (!req.headers()["apikey"]) return route.fulfill({ status: 401, body: "{}" });
    const att = SCHEMA[fn]; if (!att) { log.push("fonction inconnue " + fn); return route.fulfill({ status: 404, body: "{}" }); }
    if (Object.keys(args).sort().join() !== [...att].sort().join()) { log.push(`paramètres de ${fn}: ${Object.keys(args)} vs ${att}`); return route.fulfill({ status: 400, headers: cors, body: JSON.stringify({ message: "PARAMS" }) }); }
    try { const v = fns[fn](args); return route.fulfill({ status: 200, contentType: "application/json", headers: cors, body: v === null ? "" : JSON.stringify(v) }); }
    catch (e) { return route.fulfill({ status: 400, contentType: "application/json", headers: cors, body: JSON.stringify({ message: e.ba || "ERREUR" }) }); }
  });
}
(async () => {
  const b = await chromium.launch(); const log = [], errs = []; let fails = 0;
  const ok = (c, m) => { console.log((c ? "OK  " : "FAIL") + " " + m); if (!c) { fails++; process.exitCode = 1; } };
  const vis = l => l.waitFor({ state: "visible", timeout: 5000 }).then(() => true).catch(() => false);
  const tel = async () => { const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); await brancher(ctx, log); const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); return p; };
  const awa = await tel(), paul = await tel();
  const choisir = async (p, name, val) => p.locator(`input[name="${name}"][value="${val}"] + span`).click();

  await awa.goto(U + "/");
  ok(await vis(awa.getByRole("heading", { name: /Ce qui compte aujourd'hui/ })), "accueil");
  ok(await vis(awa.getByText("Aucun signalement").first()), "accueil : aucun signalement au départ");
  await awa.goto(U + "/signaler");
  await awa.getByRole("button", { name: "Envoyer mon signalement" }).click();
  ok(await vis(awa.getByRole("alert").filter({ hasText: "Écris le lieu" })), "erreur : lieu vide");
  await awa.fill("#lieu", "Station du marché de Bimbo");
  await awa.getByRole("button", { name: "Envoyer mon signalement" }).click();
  ok(await vis(awa.getByRole("alert").filter({ hasText: "Choisis ce que tu as vu" })), "erreur : produit non choisi");
  await choisir(awa, "objet", "Essence"); await choisir(awa, "etat", "File longue");
  await awa.fill("#valeur", "11 50"); await awa.fill("#note", "Environ 1 h d'attente");
  await awa.getByRole("button", { name: "Envoyer mon signalement" }).click();
  ok(await vis(awa.getByRole("alert").filter({ hasText: "prénom" })), "erreur : prénom obligatoire");
  await awa.fill("#nom", "Awa");
  await awa.getByRole("button", { name: "Envoyer mon signalement" }).click();
  await awa.waitForURL(/\/s\/carburant$/);
  ok(await vis(awa.locator("article b", { hasText: "Station du marché de Bimbo" })), "carte du signalement affichée");
  ok(await vis(awa.getByText("File longue")), "état affiché");
  ok(await vis(awa.getByText(/1\s?150\s?FCFA/)), "prix formaté");
  ok(await vis(awa.getByText("Signalé par Awa")), "auteur affiché");

  // Paul corrige : même station, disponible
  await paul.goto(U + "/signaler?kind=carburant");
  await paul.fill("#lieu", "Station du marché de Bimbo");
  await choisir(paul, "objet", "Essence"); await choisir(paul, "etat", "Disponible"); await paul.fill("#nom", "Paul");
  await paul.getByRole("button", { name: "Envoyer mon signalement" }).click();
  await paul.waitForURL(/\/s\/carburant$/);
  ok(await vis(paul.getByText("Disponible", { exact: true })), "le dernier signalement remplace l'ancien");
  ok(await paul.getByText("File longue").count() === 0, "une seule ligne par station et produit");
  await paul.getByRole("button", { name: /Encore vrai/ }).click();
  ok(await vis(paul.getByRole("alert").filter({ hasText: "propre signalement" })), "pas de vote sur son propre signalement");

  // Awa confirme, puis conteste
  await awa.goto(U + "/s/carburant");
  await awa.getByRole("button", { name: /Encore vrai/ }).click();
  ok(await vis(awa.getByRole("button", { name: /Encore vrai, 1 confirmations/ })), "Awa confirme : compteur à 1");
  await awa.getByRole("button", { name: /Plus vrai/ }).click();
  ok(await vis(awa.getByRole("button", { name: /Plus vrai, 1 contestations/ })), "Awa change d'avis : contestation à 1");
  ok(await vis(awa.getByRole("button", { name: /Encore vrai, 0 confirmations/ })), "la confirmation retombe à 0");

  // un visiteur sans prénom vote : le prénom est demandé
  const marc = await tel();
  await marc.goto(U + "/s/carburant");
  await marc.getByRole("button", { name: /Encore vrai/ }).click();
  ok(await vis(marc.getByLabel("Ton prénom, pour voter")), "visiteur : le prénom est demandé pour voter");
  await marc.fill("input[name=nom]", "Marc"); await marc.getByRole("button", { name: "Valider" }).click();
  ok(await vis(marc.getByRole("button", { name: /Encore vrai, 1 confirmations/ })), "visiteur : vote enregistré");

  // prix : prix obligatoire ; alerte : description obligatoire
  await awa.goto(U + "/signaler?kind=prix");
  await awa.fill("#lieu", "Marché Centre"); await choisir(awa, "objet", "Riz (kg)"); await choisir(awa, "etat", "En hausse");
  await awa.getByRole("button", { name: "Envoyer mon signalement" }).click();
  ok(await vis(awa.getByRole("alert").filter({ hasText: "prix relevé" })), "prix : obligatoire");
  await awa.fill("#valeur", "abc"); await awa.getByRole("button", { name: "Envoyer mon signalement" }).click();
  ok(await vis(awa.getByRole("alert").filter({ hasText: "en chiffres" })), "prix : doit être en chiffres");
  await awa.fill("#valeur", "900"); await awa.getByRole("button", { name: "Envoyer mon signalement" }).click();
  await awa.waitForURL(/\/s\/prix$/);
  ok(await vis(awa.getByText(/900\s?FCFA/)), "prix publié");
  await awa.goto(U + "/signaler?kind=alerte");
  await awa.fill("#lieu", "Pont de Sica"); await choisir(awa, "objet", "Route"); await choisir(awa, "etat", "Bloquée");
  await awa.getByRole("button", { name: "Envoyer mon signalement" }).click();
  ok(await vis(awa.getByRole("alert").filter({ hasText: "en quelques mots" })), "alerte : description obligatoire");
  await awa.fill("#note", "Camion en panne sur le pont");
  await awa.getByRole("button", { name: "Envoyer mon signalement" }).click();
  await awa.waitForURL(/\/s\/alerte$/);
  ok(await vis(awa.getByText("Camion en panne sur le pont")), "alerte publiée");

  // accueil : résumé, filtre, page inconnue
  await awa.goto(U + "/");
  ok(await vis(awa.getByRole("link", { name: /Carburant/ }).first()), "accueil : tuile carburant");
  const tuile = await awa.locator("a.tuile").first().innerText();
  ok(/1/.test(tuile) && /Dernier/.test(tuile), "accueil : compteur et dernier signalement : " + tuile.replace(/\n/g, " "));
  await awa.screenshot({ path: SHOT + "/ba-accueil.png", fullPage: true });
  await awa.goto(U + "/s/carburant"); await vis(awa.locator("article b", { hasText: "Station du marché de Bimbo" }));
  await awa.screenshot({ path: SHOT + "/ba-carburant.png", fullPage: true });
  await awa.selectOption("#lieu", "Bégoua");
  ok(await vis(awa.getByText(/Aucun signalement de carburant/)), "filtre : autre lieu vide");
  await awa.goto(U + "/s/nimportequoi");
  ok(await vis(awa.getByRole("heading", { name: "Page introuvable" })), "section inconnue");
  await awa.goto(U + "/signaler?kind=prix"); await vis(awa.getByRole("heading", { name: "Signaler" }));
  await awa.screenshot({ path: SHOT + "/ba-signaler.png", fullPage: true });
  ok(log.length === 0, "noms de paramètres conformes aux fonctions " + JSON.stringify(log));
  ok(errs.length === 0, "aucune erreur navigateur " + JSON.stringify(errs));
  await b.close(); console.log(fails ? `${fails} ÉCHEC(S)` : "TOUT PASSE");
})();
