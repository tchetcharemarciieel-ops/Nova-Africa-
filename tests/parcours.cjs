// Parcours complet avec un faux serveur de base de données (les fonctions et leurs paramètres exacts).
// Lancer : NEXT_PUBLIC_SUPABASE_URL=https://mock.test NEXT_PUBLIC_SUPABASE_ANON_KEY=x npm run build && npx next start -p 3100, puis node tests/parcours.cjs
const { chromium } = require("playwright");
const U = "http://localhost:3100";
const SHOT = process.env.SHOT_DIR || "/tmp";
const SCHEMA = {
  rp_register: ["p_nom", "p_secret"], rp_me: ["p_secret"],
  rp_create_profile: ["p_secret", "p_nom", "p_metier", "p_lieu", "p_apropos", "p_langues", "p_telephone"],
  rp_get_profile: ["p_slug"], rp_search_profiles: ["p_metier", "p_lieu", "p_limit"], rp_create_invite: ["p_secret"],
  rp_invite_info: ["p_code"], rp_confirm: ["p_code", "p_travail", "p_note", "p_avis", "p_prenom"],
  rp_post_need: ["p_secret", "p_titre", "p_metier", "p_lieu", "p_details"], rp_list_needs: ["p_limit"],
  rp_list_jobs: ["p_limit"],
  rp_send_message: ["p_secret", "p_to", "p_texte"], rp_inbox: ["p_secret"], rp_thread: ["p_secret", "p_conversation"], rp_unread: ["p_secret"], rp_update_profile: ["p_secret", "p_nom", "p_metier", "p_lieu", "p_apropos", "p_langues", "p_telephone"],
  rp_set_photo: ["p_secret", "p_photo", "p_mini"], rp_add_photo: ["p_secret", "p_data", "p_thumb", "p_legende"], rp_delete_photo: ["p_secret", "p_id"],
  rp_photos: ["p_slug"], rp_photo_full: ["p_id"], rp_add_parcours: ["p_secret", "p_genre", "p_titre", "p_organisme", "p_periode"], rp_delete_parcours: ["p_secret", "p_id"],
  rp_post_create: ["p_secret", "p_texte", "p_data", "p_thumb"], rp_list_posts: ["p_limit"], rp_post_photo: ["p_id"], rp_delete_post: ["p_secret", "p_id"],
  rp_org_register: ["p_secret", "p_nom", "p_secteur", "p_lieu", "p_adresse", "p_apropos", "p_logo", "p_logo_mini", "p_rccm", "p_nif", "p_rh_nom", "p_rh_tel"],
  rp_org_get: ["p_slug"], rp_org_post_job: ["p_secret", "p_titre", "p_lieu", "p_type", "p_details"], rp_stats: [],
};
const db = { members: [], profiles: [], invites: [], confs: [], needs: [], jobs: [], convs: [], msgs: [], photos: [], posts: [], parcours: [], orgs: [] };
const taille = { photo: 0, mini: 0, data: 0, thumb: 0, logo: 0 };
const hex = n => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
const uuid = () => `${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`;
const now = () => new Date().toISOString();
const fail = m => { const e = new Error(m); e.rp = m; throw e; };
const mem = s => { const m = db.members.find(x => x.secret === s); return m ? m : null; };
const need = s => mem(s) || fail("RP_AUTH");
const fns = {
  rp_register: a => { if (a.p_nom.trim().length < 2) fail("RP_NOM"); const m = { id: uuid(), nom: a.p_nom.trim(), secret: a.p_secret }; db.members.push(m); return m.id; },
  rp_me: a => { const m = mem(a.p_secret); if (!m) return null; const p = db.profiles.find(x => x.member_id === m.id); const o = db.orgs.find(x => x.member_id === m.id); return { member_id: m.id, nom: m.nom, slug: p ? p.slug : null, photo: p ? p.photo_mini || null : o ? o.logo_mini || null : null, org_slug: o ? o.slug : null, org_statut: o ? o.statut : null }; },
  rp_create_profile: a => { const m = need(a.p_secret); if (db.profiles.some(p => p.member_id === m.id)) fail("RP_DEJA"); let tel = (a.p_telephone || "").replace(/\D/g, ""); if (tel.length === 8) tel = "236" + tel; const slug = a.p_nom.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-") + "-" + hex(4); db.profiles.push({ member_id: m.id, slug, nom: a.p_nom, metier: a.p_metier, lieu: a.p_lieu, apropos: a.p_apropos, langues: a.p_langues, telephone: tel || null, cree_le: now() }); return slug; },
  rp_get_profile: a => { const p = db.profiles.find(x => x.slug === a.p_slug); if (!p) return null; const cs = db.confs.filter(c => c.slug === p.slug); return { ...p, photo: p.photo || null, parcours: db.parcours.filter(x => x.slug === p.slug).reverse(), chantiers: cs.length, moyenne: cs.length ? Math.round(cs.reduce((s, c) => s + c.note, 0) / cs.length * 10) / 10 : 0, niveau: p.apropos.length >= 20 ? 2 : 1, avis: cs.map(c => ({ note: c.note, avis: c.avis, prenom: c.prenom, travail: c.travail, cree_le: c.cree_le })) }; },
  rp_search_profiles: a => db.profiles.filter(p => (!a.p_metier || p.metier === a.p_metier) && (!a.p_lieu || p.lieu === a.p_lieu)).map(p => ({ photo: p.photo_mini || null, slug: p.slug, nom: p.nom, metier: p.metier, lieu: p.lieu, chantiers: db.confs.filter(c => c.slug === p.slug).length, niveau: p.apropos.length >= 20 ? 2 : 1 })),
  rp_create_invite: a => { const m = need(a.p_secret); const p = db.profiles.find(x => x.member_id === m.id) || fail("RP_PROFIL"); const code = hex(12); db.invites.push({ code, slug: p.slug, used: false }); return code; },
  rp_invite_info: a => { const i = db.invites.find(x => x.code === a.p_code && !x.used); if (!i) return null; const p = db.profiles.find(x => x.slug === i.slug); return { nom: p.nom, metier: p.metier }; },
  rp_confirm: a => { const i = db.invites.find(x => x.code === a.p_code && !x.used) || fail("RP_INVITE"); i.used = true; db.confs.push({ slug: i.slug, travail: a.p_travail, note: a.p_note, avis: a.p_avis, prenom: a.p_prenom, cree_le: now() }); return i.slug; },
  rp_post_need: a => { const m = need(a.p_secret); db.needs.push({ id: uuid(), member_id: m.id, nom: m.nom, titre: a.p_titre, metier: a.p_metier, lieu: a.p_lieu, details: a.p_details, cree_le: now() }); return uuid(); },
  rp_list_needs: () => [...db.needs].reverse(),
  rp_post_job_ancien: a => { const m = need(a.p_secret); db.jobs.push({ id: uuid(), member_id: m.id, titre: a.p_titre, organisation: a.p_organisation, lieu: a.p_lieu, type: a.p_type, details: a.p_details, cree_le: now() }); return uuid(); },
  rp_list_jobs: () => [...db.jobs].reverse().map(j => { const o = db.orgs.find(x => x.member_id === j.member_id); return { ...j, org_slug: o ? o.slug : null, logo: o ? o.logo_mini || null : null, verifiee: !!o && o.statut === 'verifiee' }; }),
  rp_send_message: a => { const m = need(a.p_secret); if (a.p_to === m.id || !db.members.some(x => x.id === a.p_to)) fail("RP_DEST"); const key = [m.id, a.p_to].sort().join("|"); let c = db.convs.find(x => x.key === key); if (!c) { c = { id: uuid(), key, a: m.id, b: a.p_to }; db.convs.push(c); } c.derniere = now(); db.msgs.push({ id: uuid(), conv: c.id, from: m.id, texte: a.p_texte, lu: false, cree_le: now() }); return c.id; },
  rp_inbox: a => { const m = need(a.p_secret); return db.convs.filter(c => c.a === m.id || c.b === m.id).map(c => { const o = db.members.find(x => x.id === (c.a === m.id ? c.b : c.a)); const ms = db.msgs.filter(x => x.conv === c.id); return { conversation_id: c.id, autre_id: o.id, autre_nom: o.nom, derniere: c.derniere, apercu: ms[ms.length - 1].texte, non_lus: ms.filter(x => x.from !== m.id && !x.lu).length }; }); },
  rp_thread: a => { const m = need(a.p_secret); const c = db.convs.find(x => x.id === a.p_conversation && (x.a === m.id || x.b === m.id)) || fail("RP_CONV"); const o = db.members.find(x => x.id === (c.a === m.id ? c.b : c.a)); db.msgs.filter(x => x.conv === c.id && x.from !== m.id).forEach(x => { x.lu = true; }); return { autre_id: o.id, autre_nom: o.nom, messages: db.msgs.filter(x => x.conv === c.id).map(x => ({ id: x.id, moi: x.from === m.id, texte: x.texte, cree_le: x.cree_le })) }; },
  rp_update_profile: a => { const m = need(a.p_secret); const p = db.profiles.find(x => x.member_id === m.id) || fail("RP_PROFIL"); if (a.p_nom.trim().length < 2) fail("RP_NOM"); let tel = (a.p_telephone || "").replace(/\D/g, ""); if (tel.length === 8) tel = "236" + tel; Object.assign(p, { nom: a.p_nom, metier: a.p_metier, lieu: a.p_lieu, apropos: a.p_apropos, langues: a.p_langues, telephone: tel || null }); m.nom = a.p_nom; return null; },
  rp_set_photo: a => { const m = need(a.p_secret); const p = db.profiles.find(x => x.member_id === m.id); const o = db.orgs.find(x => x.member_id === m.id); const t = p || o || fail("RP_PROFIL"); if (a.p_photo && (a.p_photo.length > 60000 || a.p_mini.length > 8000 || !a.p_photo.startsWith("data:image/jpeg;base64,"))) fail("TROP_GROS"); if (a.p_photo) { taille.photo = a.p_photo.length; taille.mini = a.p_mini.length; } if (p) { p.photo = a.p_photo; p.photo_mini = a.p_mini; } else { o.logo = a.p_photo; o.logo_mini = a.p_mini; } return null; },
  rp_add_photo: a => { const m = need(a.p_secret); const p = db.profiles.find(x => x.member_id === m.id) || fail("RP_PROFIL"); if (a.p_data.length > 200000 || a.p_thumb.length > 40000) fail("TROP_GROS"); if (db.photos.filter(x => x.slug === p.slug).length >= 12) fail("RP_LIMITE"); taille.data = a.p_data.length; taille.thumb = a.p_thumb.length; const id = uuid(); db.photos.push({ id, slug: p.slug, data: a.p_data, thumb: a.p_thumb, legende: a.p_legende }); return id; },
  rp_delete_photo: a => { const m = need(a.p_secret); const p = db.profiles.find(x => x.member_id === m.id); db.photos = db.photos.filter(x => !(x.id === a.p_id && p && x.slug === p.slug)); return null; },
  rp_photos: a => db.photos.filter(x => x.slug === a.p_slug).reverse().map(x => ({ id: x.id, thumb: x.thumb, legende: x.legende })),
  rp_photo_full: a => (db.photos.find(x => x.id === a.p_id) || {}).data || null,
  rp_add_parcours: a => { const m = need(a.p_secret); const p = db.profiles.find(x => x.member_id === m.id) || fail("RP_PROFIL"); const id = uuid(); db.parcours.push({ id, slug: p.slug, genre: a.p_genre, titre: a.p_titre, organisme: a.p_organisme, periode: a.p_periode }); return id; },
  rp_delete_parcours: a => { const m = need(a.p_secret); const p = db.profiles.find(x => x.member_id === m.id); db.parcours = db.parcours.filter(x => !(x.id === a.p_id && p && x.slug === p.slug)); return null; },
  rp_post_create: a => { const m = need(a.p_secret); if (a.p_texte.trim().length < 3) fail("RP_TEXTE"); const id = uuid(); db.posts.push({ id, member_id: m.id, texte: a.p_texte, data: a.p_data, thumb: a.p_thumb, cree_le: now() }); return id; },
  rp_list_posts: () => [...db.posts].reverse().map(x => { const m = db.members.find(k => k.id === x.member_id); const p = db.profiles.find(k => k.member_id === m.id); const o = db.orgs.find(k => k.member_id === m.id); return { id: x.id, member_id: m.id, nom: m.nom, slug: p ? p.slug : null, org_slug: o ? o.slug : null, verifiee: !!o && o.statut === "verifiee", photo: p ? p.photo_mini || null : o ? o.logo_mini || null : null, lieu: p ? p.lieu : o ? o.lieu : "", texte: x.texte, thumb: x.thumb, cree_le: x.cree_le }; }),
  rp_post_photo: a => (db.posts.find(x => x.id === a.p_id) || {}).data || null,
  rp_delete_post: a => { const m = need(a.p_secret); db.posts = db.posts.filter(x => !(x.id === a.p_id && x.member_id === m.id)); return null; },
  rp_org_register: a => { const m = need(a.p_secret); if (db.orgs.some(o => o.member_id === m.id)) fail("RP_DEJA"); if (a.p_rccm.length < 4 || a.p_nif.length < 4 || a.p_rh_nom.length < 2) fail("RP_ORG"); let tel = a.p_rh_tel.replace(/\D/g, ""); if (tel.length === 8) tel = "236" + tel; if (a.p_logo) taille.logo = a.p_logo.length; const slug = a.p_nom.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-") + "-" + hex(4); db.orgs.push({ member_id: m.id, slug, nom: a.p_nom, secteur: a.p_secteur, lieu: a.p_lieu, adresse: a.p_adresse, apropos: a.p_apropos, logo: a.p_logo, logo_mini: a.p_logo_mini, rccm: a.p_rccm, nif: a.p_nif, rh_nom: a.p_rh_nom, rh_tel: tel, statut: "attente" }); m.nom = a.p_nom; return slug; },
  rp_org_get: a => { const o = db.orgs.find(x => x.slug === a.p_slug); if (!o) return null; return { slug: o.slug, member_id: o.member_id, nom: o.nom, secteur: o.secteur, lieu: o.lieu, adresse: o.adresse, apropos: o.apropos, logo: o.logo, statut: o.statut, cree_le: now(), offres: db.jobs.filter(j => j.member_id === o.member_id).reverse() }; },
  rp_org_post_job: a => { const m = need(a.p_secret); const o = db.orgs.find(x => x.member_id === m.id) || fail("RP_ORG"); db.jobs.push({ id: uuid(), member_id: m.id, titre: a.p_titre, organisation: o.nom, lieu: a.p_lieu, type: a.p_type, details: a.p_details, cree_le: now() }); return uuid(); },
  rp_stats: () => ({ profils: db.profiles.length, entreprises: db.orgs.filter(o => o.statut === "verifiee").length, offres: db.jobs.length, chantiers: db.confs.length }),
  rp_unread: a => { const m = mem(a.p_secret); if (!m) return 0; return db.msgs.filter(x => { const c = db.convs.find(k => k.id === x.conv); return (c.a === m.id || c.b === m.id) && x.from !== m.id && !x.lu; }).length; },
};
async function brancher(ctx, log) {
  await ctx.route("https://mock.test/**", async route => {
    const req = route.request();
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "POST, OPTIONS" } });
    const fn = req.url().split("/rpc/")[1];
    const args = JSON.parse(req.postData() || "{}");
    if (!req.headers()["apikey"]) return route.fulfill({ status: 401, body: "{}" });
    const attendu = SCHEMA[fn];
    if (!attendu) { log.push("fonction inconnue " + fn); return route.fulfill({ status: 404, body: "{}" }); }
    const recu = Object.keys(args).sort().join(","), voulu = [...attendu].sort().join(",");
    if (recu !== voulu) { log.push(`paramètres de ${fn} : reçu ${recu}, attendu ${voulu}`); return route.fulfill({ status: 400, body: JSON.stringify({ message: "PARAMS" }) }); }
    try { return route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(fns[fn](args)) }); }
    catch (e) { return route.fulfill({ status: 400, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ message: e.rp || "ERREUR" }) }); }
  });
}
(async () => {
  const b = await chromium.launch();
  const log = [], errs = [];
  let fails = 0;
  const ok = (c, m) => { console.log((c ? "OK  " : "FAIL") + " " + m); if (!c) { fails++; process.exitCode = 1; } };
  const vis = loc => loc.waitFor({ state: "visible", timeout: 5000 }).then(() => true).catch(() => false);
  const tel = async () => { const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); await brancher(ctx, log); const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); return p; };
  const pro = await tel(), cli = await tel(), ent = await tel();
  const PHOTO = __dirname + "/photo-gros.png", LOGO = __dirname + "/logo.png";

  // ===== accueil public (visiteur)
  await pro.goto(U + "/");
  ok(await vis(pro.getByRole("heading", { level: 1, name: /Trouve quelqu.un de confiance/ })), "accueil : grand titre du hero");
  ok(await vis(pro.getByRole("link", { name: "Kargora, accueil" })), "barre flottante : logo Kargora");
  for (const t of ["Ta galerie de réalisations", "Des chantiers confirmés", "Recrute des profils vérifiés"]) ok(await vis(pro.getByText(t).first()), "section : " + t);
  ok(await pro.locator(".etapes5 .num").count() === 5, "timeline : 5 étapes numérotées");
  ok(await vis(pro.getByRole("link", { name: /Je suis un Professionnel \/ Candidat/ })), "accueil : bouton Professionnel / Candidat");
  ok(await vis(pro.getByRole("link", { name: /Je suis une Entreprise \/ ONG/ })), "accueil : bouton Entreprise / ONG");
  ok(await vis(pro.getByRole("link", { name: "Se connecter" })), "accueil : lien Se connecter");
  ok(await pro.getByRole("link", { name: /Partager une réalisation/ }).count() === 0, "visiteur : pas de zone de publication");
  ok(await vis(pro.getByText("Rien pour l'instant")), "fil vide : message rassurant");
  ok(await vis(pro.getByRole("link", { name: "Créer mon compte" }).last()), "fil vide : bouton Créer mon compte");
  for (const [n, h] of [["À propos", "/a-propos"], ["Conditions d'utilisation", "/cgu"], ["Confidentialité", "/confidentialite"], ["Règles de vérification", "/verification"], ["Contact", "/contact"]])
    ok((await pro.locator("footer a", { hasText: n }).first().getAttribute("href")) === h, "pied de page : lien " + n);
  await pro.getByRole("button", { name: "Offres" }).click();
  ok(await vis(pro.getByText("Rien dans cette catégorie pour le moment")), "catégorie vide");
  await pro.screenshot({ path: SHOT + "/k1-accueil-visiteur.png", fullPage: true });

  // pages d'information
  for (const [u, t] of [["/a-propos", "À propos de Kargora"], ["/cgu", "Conditions d'utilisation"], ["/confidentialite", "Politique de confidentialité"], ["/verification", "Règles de vérification"], ["/contact", "Contact"]]) {
    await pro.goto(U + u); ok(await vis(pro.getByRole("heading", { name: t, exact: true })), "page " + u);
  }
  await pro.goto(U + "/verification");
  ok(await vis(pro.getByText(/jamais affichés/).first()), "règles de vérification : RCCM/NIF jamais affichés");
  await pro.goto(U + "/cgu"); ok(await vis(pro.getByText(/ne demande jamais d'argent/)), "CGU : règle contre les fausses offres");
  await pro.goto(U + "/inscription");
  ok(await vis(pro.getByRole("link", { name: /Professionnel \/ Candidat/ })) && await vis(pro.getByRole("link", { name: /Entreprise \/ ONG/ })), "choix d'inscription : deux parcours");

  // PWA
  const man = await (await pro.request.get(U + "/manifest.webmanifest")).json();
  ok(man.name === "Kargora" && man.theme_color === "#064e3b" && man.display === "standalone", "manifeste");
  ok((await pro.request.get(U + "/sw.js")).status() === 200 && (await pro.request.get(U + "/offline.html")).status() === 200, "service worker et page hors connexion");

  // ===== inscription professionnel avec photo
  await pro.goto(U + "/inscription-candidat");
  await pro.getByRole("button", { name: "Créer ma carte pro" }).click();
  ok(await vis(pro.getByRole("alert").filter({ hasText: "Écris ton nom" })), "candidat : nom obligatoire");
  await pro.fill("#nom", "Joseph Ngaïkosset");
  await pro.getByRole("button", { name: "Créer ma carte pro" }).click();
  ok(await vis(pro.getByRole("alert").filter({ hasText: "quartier ou ta ville" })), "candidat : quartier obligatoire");
  await pro.selectOption("#lieu", "Bimbo"); await pro.selectOption("#metier", "Plomberie");
  await pro.getByRole("button", { name: "Créer ma carte pro" }).click();
  ok(await vis(pro.getByRole("alert").filter({ hasText: "Coche la case" })), "candidat : conditions obligatoires");
  await pro.locator('input[type=file]').setInputFiles(PHOTO);
  ok(await vis(pro.getByText(/Image réduite : \d+ Ko/)), "photo de profil : aperçu et taille après réduction");
  const kb = parseInt((await pro.getByText(/Image réduite : \d+ Ko/).innerText()).match(/(\d+) Ko/)[1], 10);
  ok(kb > 0 && kb <= 150, "photo de profil réduite à " + kb + " Ko (max 150)");
  await pro.getByLabel(/J'ai lu/).check();
  await pro.getByRole("button", { name: "Créer ma carte pro" }).click();
  await pro.waitForURL(/\/moi\?bienvenue=1/);
  ok(await vis(pro.getByText("Compte créé.")), "candidat : code de sécurité affiché");
  ok(taille.photo > 0 && taille.photo <= 60000 && taille.mini > 0 && taille.mini <= 8000, `photo envoyée : ${taille.photo} + ${taille.mini} caractères`);
  ok(await vis(pro.locator('header img[src^="data:image/jpeg"]')), "la barre du haut montre la vraie photo");
  await pro.getByRole("button", { name: "J'ai noté mon code" }).click();
  await pro.getByRole("link", { name: "Voir ma carte" }).click();
  await pro.waitForURL(/\/p\/joseph-ngaikosset-/);
  const slug = pro.url().split("/p/")[1].split("?")[0];
  ok(await vis(pro.getByRole("heading", { name: "Joseph Ngaïkosset" })), "carte créée");
  ok(await vis(pro.locator('article img[src^="data:image/jpeg"]')), "profil : photo réelle affichée (plus d'initiales)");
  ok(await pro.getByText(/Appeler/).count() === 0, "numéro caché par défaut");

  // parcours
  await pro.getByRole("button", { name: "+ Expérience" }).click();
  await pro.fill("#pt", "Plombier chef d'équipe"); await pro.fill("#po", "Entreprise BTP Bimbo"); await pro.fill("#pp", "2019 – 2024");
  await pro.getByRole("button", { name: "Ajouter", exact: true }).click();
  ok(await vis(pro.getByText("Plombier chef d'équipe")), "parcours : expérience ajoutée");
  await pro.getByRole("button", { name: "+ Formation / diplôme" }).click();
  await pro.fill("#pt", "CAP Plomberie"); await pro.fill("#po", "Lycée technique de Bangui");
  await pro.getByRole("button", { name: "Ajouter", exact: true }).click();
  ok(await vis(pro.getByText("CAP Plomberie")) && await vis(pro.getByText(/Formation \/ diplôme · Lycée technique de Bangui/)), "parcours : formation ajoutée");

  // galerie
  ok(await vis(pro.getByRole("heading", { name: /Mes réalisations & formations/ })), "galerie : titre");
  await pro.getByRole("button", { name: "Ajouter une photo" }).click();
  await pro.getByRole("button", { name: "Ajouter à ma galerie" }).click();
  ok(await vis(pro.getByRole("alert").filter({ hasText: "Choisis d'abord une image" })), "galerie : image obligatoire");
  await pro.locator('#leg').fill("Salle de bain refaite à Bimbo");
  await pro.locator('input[type=file]').last().setInputFiles(PHOTO);
  await vis(pro.getByText(/Image réduite/).last());
  await pro.getByRole("button", { name: "Ajouter à ma galerie" }).click();
  ok(await vis(pro.getByText("Salle de bain refaite à Bimbo")), "galerie : photo avec sa légende");
  ok(taille.data > 0 && taille.data <= 200000 && taille.thumb > 0 && taille.thumb <= 40000, `galerie : grande ${taille.data} (≤200000), aperçu ${taille.thumb} (≤40000) caractères`);
  await pro.getByRole("button", { name: "Ajouter une photo" }).click();
  await pro.locator('#leg').fill("Diplôme CAP"); await pro.locator('input[type=file]').last().setInputFiles(PHOTO);
  await vis(pro.getByText(/Image réduite/).last());
  await pro.getByRole("button", { name: "Ajouter à ma galerie" }).click();
  ok(await vis(pro.getByText("Diplôme CAP")), "galerie : deuxième photo");
  await pro.screenshot({ path: SHOT + "/k2-profil-galerie.png", fullPage: true });

  // la cliente (visiteuse) voit la grille à 2 colonnes et ouvre une photo en grand
  await cli.goto(U + "/p/" + slug);
  ok(await vis(cli.getByRole("button", { name: /Voir en grand : Salle de bain/ })), "visiteur : galerie visible");
  const cols = await cli.locator(".galerie").evaluate(e => getComputedStyle(e).gridTemplateColumns.split(" ").length);
  ok(cols === 2, "galerie : 2 colonnes (" + cols + ")");
  ok(await cli.getByRole("button", { name: "Supprimer cette photo" }).count() === 0 && await cli.getByRole("button", { name: "Ajouter une photo" }).count() === 0, "visiteur : pas de boutons de modification");
  await cli.getByRole("button", { name: /Voir en grand : Salle de bain/ }).click();
  ok(await vis(cli.getByRole("dialog")), "clic : l'image s'ouvre en grand");
  await cli.waitForFunction(() => (document.querySelector(".lightbox img")?.getAttribute("src") || "").length > 60000, null, { timeout: 5000 }).then(() => ok(true, "image en grand : la version complète se charge")).catch(() => ok(false, "image en grand : la version complète se charge"));
  await cli.screenshot({ path: SHOT + "/k3-lightbox.png" });
  await cli.keyboard.press("Escape");
  ok(await cli.getByRole("dialog").count() === 0, "Échap ferme l'image");
  ok(await vis(cli.getByText("CAP Plomberie")), "visiteur : voit le parcours");
  ok(await vis(cli.getByRole("link", { name: "Message", exact: true })), "visiteur : bouton Message");

  // propriétaire supprime une photo
  await pro.getByRole("button", { name: "Supprimer cette photo" }).first().click();
  await pro.waitForFunction(() => document.querySelectorAll(".vignette").length === 1);
  ok(true, "galerie : suppression d'une photo");

  // ===== publication d'une réalisation avec photo
  await pro.goto(U + "/publier");
  ok(await vis(pro.getByRole("link", { name: /Partager une réalisation \/ actualité/ })), "Publier : option Partager une réalisation / actualité");
  ok(await vis(pro.getByRole("link", { name: /Publier une offre d'emploi.*Réservé aux entreprises/ })), "Publier : offre d'emploi réservée aux entreprises");
  await pro.getByRole("link", { name: /Partager une réalisation \/ actualité/ }).click();
  await pro.getByRole("button", { name: "Publier", exact: true }).click();
  ok(await vis(pro.getByRole("alert").filter({ hasText: "Écris quelques mots" })), "réalisation : texte obligatoire");
  await pro.locator('input[type=file]').setInputFiles(PHOTO);
  await vis(pro.getByText(/Image réduite/));
  await pro.fill("#texte", "Chantier terminé à Bimbo : plomberie complète en 6 jours.");
  await pro.getByRole("button", { name: "Publier", exact: true }).click();
  await pro.waitForURL(U + "/");
  ok(await vis(pro.getByText("Chantier terminé à Bimbo : plomberie complète en 6 jours.")), "fil : la réalisation apparaît");
  ok(await vis(pro.locator('article img[alt^="Chantier terminé"]')), "fil : la photo de la réalisation apparaît");
  ok(await vis(pro.getByRole("link", { name: /Partager une réalisation…/ })), "membre : zone de publication sur l'accueil");
  await pro.screenshot({ path: SHOT + "/k4-accueil-membre.png", fullPage: true });
  await pro.getByRole("button", { name: /Voir l'image en grand/ }).first().click();
  ok(await vis(pro.getByRole("dialog")), "fil : clic sur la photo → grand format");
  await pro.keyboard.press("Escape");
  // filtres
  await pro.getByRole("button", { name: "Besoins", exact: true }).click();
  ok(await pro.getByText("Chantier terminé à Bimbo : plomberie complète en 6 jours.").count() === 0, "filtre Besoins : la réalisation disparaît");
  await pro.getByRole("button", { name: "Réalisations", exact: true }).click();
  ok(await vis(pro.getByText("Chantier terminé à Bimbo : plomberie complète en 6 jours.")), "filtre Réalisations");
  await pro.selectOption('select[aria-label^="Filtrer par quartier"]', "Bambari");
  ok(await pro.getByText("Chantier terminé à Bimbo : plomberie complète en 6 jours.").count() === 0, "filtre quartier : autre quartier masque la réalisation");
  await pro.selectOption('select[aria-label^="Filtrer par quartier"]', "Bimbo");
  ok(await vis(pro.getByText("Chantier terminé à Bimbo : plomberie complète en 6 jours.")), "filtre quartier : Bimbo la montre");

  // ===== confirmation d'un chantier par la cliente
  await pro.goto(U + "/p/" + slug);
  await pro.getByRole("button", { name: "Demander une confirmation" }).click();
  await pro.waitForSelector("text=Lien à envoyer à ton client");
  const lien = (await pro.locator("b", { hasText: "/confirmer/" }).first().innerText()).trim();
  ok(/\/confirmer\/[0-9a-f]{12}$/.test(lien), "lien de confirmation généré");
  await cli.goto(lien.replace(/^https?:\/\/[^/]+/, U));
  await cli.locator("#travail").fill("Plomberie, salle de bain");
  await cli.locator("label", { hasText: /^5$/ }).click();
  await cli.fill("#avis", "Travail propre, ponctuel, prix honnête."); await cli.fill("#prenom", "Claire");
  await cli.getByRole("button", { name: "Oui, le travail est fait" }).click();
  ok(await vis(cli.getByRole("heading", { name: "Merci !" })), "client : confirmation enregistrée");
  await cli.goto(U + "/p/" + slug);
  ok(await vis(cli.getByText(/Claire · chantier confirmé/)), "avis marqué « chantier confirmé »");

  // ===== besoin de la cliente, réponse du pro, messages
  await cli.goto(U + "/besoins/nouveau");
  await cli.fill("#titre", "Plombier demain matin"); await cli.selectOption("#metier", "Plomberie"); await cli.selectOption("#lieu", "Bimbo");
  await cli.fill("#nom", "Claire Mbala");
  await cli.getByRole("button", { name: "Publier mon besoin" }).click();
  await cli.waitForURL(/\/besoins$/);
  ok(await vis(cli.getByText("Plombier demain matin")), "besoin publié");
  await pro.goto(U + "/");
  await pro.getByRole("button", { name: "Tout", exact: true }).click();
  ok(await vis(pro.getByText("Plombier demain matin")), "pro : voit le besoin sur l'accueil");
  await pro.getByRole("link", { name: "Répondre" }).first().click();
  await pro.fill("#texte", "Bonjour Claire, je suis libre demain à 9 h.");
  await pro.getByRole("button", { name: "Envoyer" }).click();
  await pro.waitForURL(/\/messages\/[0-9a-f-]{36}$/);
  await cli.goto(U + "/");
  ok(await vis(cli.getByRole("link", { name: /Messages, 1 non lus/ })), "cliente : compteur de messages non lus");

  // ===== entreprise : offres réservées, inscription avec logo, vérification
  await cli.goto(U + "/emplois/nouveau");
  ok(await vis(cli.getByText(/réservées aux entreprises et ONG inscrites/)), "offre : réservée aux entreprises");
  await ent.goto(U + "/connexion");
  ok(await vis(ent.getByRole("radio", { name: "Entreprise / ONG" })), "connexion : choix du profil");
  await ent.goto(U + "/inscription-entreprise");
  await ent.screenshot({ path: SHOT + "/k5-inscription-entreprise.png", fullPage: true });
  await ent.getByRole("button", { name: "Envoyer ma demande" }).click();
  ok(await vis(ent.getByRole("alert").filter({ hasText: "nom de l'entreprise" })), "entreprise : nom obligatoire");
  await ent.fill("#nom", "Société Centrafricaine de Construction");
  await ent.selectOption("#secteur", "Construction et BTP"); await ent.selectOption("#lieu", "Bangui 3e arr.");
  await ent.getByRole("button", { name: "Envoyer ma demande" }).click();
  ok(await vis(ent.getByRole("alert").filter({ hasText: "RCCM" })), "entreprise : RCCM obligatoire");
  await ent.fill("#rccm", "CA/BG/2026A1234");
  await ent.getByRole("button", { name: "Envoyer ma demande" }).click();
  ok(await vis(ent.getByRole("alert").filter({ hasText: "NIF" })), "entreprise : NIF ou agrément obligatoire");
  await ent.fill("#nif", "M2026000111222X");
  await ent.getByRole("button", { name: "Envoyer ma demande" }).click();
  ok(await vis(ent.getByRole("alert").filter({ hasText: "responsable RH" })), "entreprise : responsable RH obligatoire");
  await ent.fill("#rh_nom", "Aline Gbaya"); await ent.fill("#rh_tel", "75 11 22 33");
  await ent.locator('input[type=file]').setInputFiles(LOGO);
  await vis(ent.getByText(/Image réduite/));
  await ent.getByRole("button", { name: "Envoyer ma demande" }).click();
  ok(await vis(ent.getByRole("alert").filter({ hasText: "Coche la case" })), "entreprise : confirmation obligatoire");
  await ent.getByLabel(/Je confirme que ces informations/).check();
  await ent.getByRole("button", { name: "Envoyer ma demande" }).click();
  await ent.waitForURL(/\/moi\?bienvenue=1/);
  ok(taille.logo > 0 && taille.logo <= 60000, "logo réduit : " + taille.logo + " caractères");
  await ent.getByRole("button", { name: "J'ai noté mon code" }).click();
  ok(await vis(ent.getByText(/En attente de vérification/).first()), "Moi : entreprise en attente de vérification");
  await ent.getByRole("link", { name: "Voir ma page" }).click();
  await ent.waitForURL(/\/e\/societe-centrafricaine/);
  ok(await vis(ent.getByText("En attente de vérification").first()), "page entreprise : statut en attente");
  ok(await ent.getByText("Entreprise vérifiée", { exact: true }).count() === 0, "pas de badge vert avant validation");
  ok(await vis(ent.locator('article img[src^="data:image/jpeg"]')), "page entreprise : logo affiché");
  await ent.getByRole("link", { name: "Publier une offre" }).first().click();
  await ent.fill("#titre", "Comptable junior"); await ent.selectOption("#type", "CDD"); await ent.selectOption("#lieu", "Bangui 3e arr.");
  await ent.getByRole("button", { name: "Publier l'offre" }).click();
  await ent.waitForURL(/\/emplois$/);
  ok(await vis(ent.getByText("Comptable junior")), "offre publiée par l'entreprise");
  ok(await vis(ent.getByText(/Méfie-toi de toute offre/)), "avertissement anti-arnaque");
  ok(await ent.locator("article .verif", { hasText: "Entreprise vérifiée" }).count() === 0, "offre : pas de badge avant validation");
  // validation par le propriétaire (dans Supabase) : le badge vert apparaît, les numéros légaux ne sont jamais montrés
  db.orgs[0].statut = "verifiee";
  await ent.goto(U + "/e/" + db.orgs[0].slug);
  ok(await vis(ent.getByText("Entreprise vérifiée", { exact: true }).first()), "badge vert « Entreprise vérifiée » après validation");
  ok(await vis(ent.getByText(/RCCM et NIF contrôlés/)), "mention officielle : RCCM/NIF contrôlé");
  await cli.goto(U + "/e/" + db.orgs[0].slug);
  ok(await vis(cli.getByText("Comptable junior")), "visiteur : voit les offres actives de l'entreprise");
  const html = await cli.content();
  ok(!html.includes("CA/BG/2026A1234") && !html.includes("M2026000111222X") && !html.includes("75 11 22 33") && !html.includes("23675112233"), "RCCM, NIF et téléphone RH jamais affichés");
  await cli.screenshot({ path: SHOT + "/k6-page-entreprise.png", fullPage: true });
  await cli.goto(U + "/emplois");
  ok(await vis(cli.locator("article .verif", { hasText: "Entreprise vérifiée" })), "liste des offres : badge sur l'offre vérifiée");
  await cli.goto(U + "/");
  ok(await vis(cli.locator("article.carte").getByText("Comptable junior")), "accueil : l'offre vérifiée apparaît dans le fil");
  await cli.getByRole("button", { name: "Offres", exact: true }).click();
  await cli.selectOption('select[aria-label^="Filtrer par quartier"]', "Bimbo");
  ok(await cli.locator("article.carte").getByText("Comptable junior").count() === 0, "filtre quartier : l'offre de Bangui 3e disparaît pour Bimbo");
  ok(await vis(cli.getByText(/\d+/).first()), "chiffres affichés");
  await cli.goto(U + "/chercher?m=Plomberie");
  ok(await vis(cli.getByText("Joseph Ngaïkosset")) && await vis(cli.getByText(/1 chantier confirmé/)), "recherche : professionnel et chantier confirmé");
  ok(await vis(cli.locator('img[src^="data:image/jpeg"]')), "recherche : photo du professionnel dans la liste");

  // ===== compte, code, paramètres, connexion (parcours existants)
  const nouv = await tel();
  await nouv.goto(U + "/moi");
  ok(await vis(nouv.getByText("Tu n'es pas connecté(e) sur ce téléphone.")), "Moi sans compte");
  await nouv.goto(U + "/inscription-candidat");
  await nouv.fill("#nom", "Marie Kette"); await nouv.selectOption("#lieu", "Bambari"); await nouv.selectOption("#metier", "Couture et mode");
  await nouv.getByLabel(/J'ai lu/).check();
  await nouv.getByRole("button", { name: "Créer ma carte pro" }).click();
  await nouv.waitForURL(/\/moi\?bienvenue=1/);
  const codeAffiche = (await nouv.getByLabel("Mon code de connexion").first().innerText()).trim();
  ok(/^([0-9a-f]{6} ){11}[0-9a-f]{6}$/.test(codeAffiche), "code de sécurité généré et visible");
  ok(await vis(nouv.getByRole("button", { name: "Copier mon code" })), "bouton « Copier mon code »");
  await nouv.getByRole("button", { name: "J'ai noté mon code" }).click();
  ok(await nouv.locator('header img[src^="data:image/jpeg"]').count() === 0, "sans photo : les initiales restent");
  await nouv.goto(U + "/parametres");
  await nouv.getByRole("button", { name: "Afficher mon code" }).click();
  const code = (await nouv.getByLabel("Mon code de connexion").innerText()).trim();
  await nouv.getByRole("button", { name: "Quitter ce téléphone" }).click();
  await nouv.getByRole("button", { name: "Oui, quitter" }).click();
  await nouv.waitForURL(U + "/");
  await nouv.goto(U + "/connexion");
  await nouv.fill("#code", "0000 abcd");
  await nouv.getByRole("button", { name: "Se connecter" }).click();
  ok(await vis(nouv.getByRole("alert").filter({ hasText: "Code non reconnu" })), "connexion : mauvais code refusé");
  await nouv.fill("#code", code);
  await nouv.getByRole("button", { name: "Se connecter" }).click();
  await nouv.waitForURL(/\/moi$/);
  ok(await vis(nouv.getByRole("heading", { name: "Marie Kette" })), "connexion avec le code : compte retrouvé");
  await nouv.goto(U + "/moi/carte");
  await nouv.fill("#apropos", "Couture et coiffure, 5 ans d'expérience à Bambari.");
  await nouv.getByRole("button", { name: "Enregistrer" }).click();
  await nouv.waitForURL(/\/p\/marie-kette-/);
  ok(await vis(nouv.getByText(/Niveau 2/).first()), "la carte passe au niveau 2 après la présentation");

  // aucun renvoi vers WhatsApp quand aucun numéro n'est montré
  let wa = 0;
  for (const u of ["/", "/chercher", "/publier", "/besoins", "/emplois", "/messages", "/p/" + slug, "/e/" + db.orgs[0].slug]) { await cli.goto(U + u); await cli.waitForTimeout(300); wa += (await cli.content()).includes("wa.me") ? 1 : 0; }
  ok(wa === 0, "aucun lien WhatsApp quand aucun numéro n'est montré");
  // pas de débordement horizontal sur téléphone
  for (const u of ["/", "/inscription-candidat", "/inscription-entreprise", "/connexion", "/p/" + slug, "/e/" + db.orgs[0].slug, "/cgu"]) {
    await cli.goto(U + u); await cli.waitForTimeout(250);
    const d = await cli.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(d <= 0, "pas de défilement horizontal : " + u);
  }
  ok(log.length === 0, "noms de paramètres conformes aux fonctions : " + JSON.stringify(log));
  ok(errs.length === 0, "aucune erreur navigateur " + JSON.stringify(errs));
  await b.close();
  console.log(fails ? `${fails} ÉCHEC(S)` : "TOUT PASSE");
})();
