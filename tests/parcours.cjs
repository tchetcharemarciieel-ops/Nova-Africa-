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
  rp_post_job: ["p_secret", "p_titre", "p_organisation", "p_lieu", "p_type", "p_details"], rp_list_jobs: ["p_limit"],
  rp_send_message: ["p_secret", "p_to", "p_texte"], rp_inbox: ["p_secret"], rp_thread: ["p_secret", "p_conversation"], rp_unread: ["p_secret"], rp_update_profile: ["p_secret", "p_nom", "p_metier", "p_lieu", "p_apropos", "p_langues", "p_telephone"],
};
const db = { members: [], profiles: [], invites: [], confs: [], needs: [], jobs: [], convs: [], msgs: [] };
const hex = n => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
const uuid = () => `${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`;
const now = () => new Date().toISOString();
const fail = m => { const e = new Error(m); e.rp = m; throw e; };
const mem = s => { const m = db.members.find(x => x.secret === s); return m ? m : null; };
const need = s => mem(s) || fail("RP_AUTH");
const fns = {
  rp_register: a => { if (a.p_nom.trim().length < 2) fail("RP_NOM"); const m = { id: uuid(), nom: a.p_nom.trim(), secret: a.p_secret }; db.members.push(m); return m.id; },
  rp_me: a => { const m = mem(a.p_secret); if (!m) return null; const p = db.profiles.find(x => x.member_id === m.id); return { member_id: m.id, nom: m.nom, slug: p ? p.slug : null }; },
  rp_create_profile: a => { const m = need(a.p_secret); if (db.profiles.some(p => p.member_id === m.id)) fail("RP_DEJA"); let tel = (a.p_telephone || "").replace(/\D/g, ""); if (tel.length === 8) tel = "236" + tel; const slug = a.p_nom.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-") + "-" + hex(4); db.profiles.push({ member_id: m.id, slug, nom: a.p_nom, metier: a.p_metier, lieu: a.p_lieu, apropos: a.p_apropos, langues: a.p_langues, telephone: tel || null, cree_le: now() }); return slug; },
  rp_get_profile: a => { const p = db.profiles.find(x => x.slug === a.p_slug); if (!p) return null; const cs = db.confs.filter(c => c.slug === p.slug); return { ...p, chantiers: cs.length, moyenne: cs.length ? Math.round(cs.reduce((s, c) => s + c.note, 0) / cs.length * 10) / 10 : 0, niveau: p.apropos.length >= 20 ? 2 : 1, avis: cs.map(c => ({ note: c.note, avis: c.avis, prenom: c.prenom, travail: c.travail, cree_le: c.cree_le })) }; },
  rp_search_profiles: a => db.profiles.filter(p => (!a.p_metier || p.metier === a.p_metier) && (!a.p_lieu || p.lieu === a.p_lieu)).map(p => ({ slug: p.slug, nom: p.nom, metier: p.metier, lieu: p.lieu, chantiers: db.confs.filter(c => c.slug === p.slug).length, niveau: p.apropos.length >= 20 ? 2 : 1 })),
  rp_create_invite: a => { const m = need(a.p_secret); const p = db.profiles.find(x => x.member_id === m.id) || fail("RP_PROFIL"); const code = hex(12); db.invites.push({ code, slug: p.slug, used: false }); return code; },
  rp_invite_info: a => { const i = db.invites.find(x => x.code === a.p_code && !x.used); if (!i) return null; const p = db.profiles.find(x => x.slug === i.slug); return { nom: p.nom, metier: p.metier }; },
  rp_confirm: a => { const i = db.invites.find(x => x.code === a.p_code && !x.used) || fail("RP_INVITE"); i.used = true; db.confs.push({ slug: i.slug, travail: a.p_travail, note: a.p_note, avis: a.p_avis, prenom: a.p_prenom, cree_le: now() }); return i.slug; },
  rp_post_need: a => { const m = need(a.p_secret); db.needs.push({ id: uuid(), member_id: m.id, nom: m.nom, titre: a.p_titre, metier: a.p_metier, lieu: a.p_lieu, details: a.p_details, cree_le: now() }); return uuid(); },
  rp_list_needs: () => [...db.needs].reverse(),
  rp_post_job: a => { const m = need(a.p_secret); db.jobs.push({ id: uuid(), member_id: m.id, titre: a.p_titre, organisation: a.p_organisation, lieu: a.p_lieu, type: a.p_type, details: a.p_details, cree_le: now() }); return uuid(); },
  rp_list_jobs: () => [...db.jobs].reverse(),
  rp_send_message: a => { const m = need(a.p_secret); if (a.p_to === m.id || !db.members.some(x => x.id === a.p_to)) fail("RP_DEST"); const key = [m.id, a.p_to].sort().join("|"); let c = db.convs.find(x => x.key === key); if (!c) { c = { id: uuid(), key, a: m.id, b: a.p_to }; db.convs.push(c); } c.derniere = now(); db.msgs.push({ id: uuid(), conv: c.id, from: m.id, texte: a.p_texte, lu: false, cree_le: now() }); return c.id; },
  rp_inbox: a => { const m = need(a.p_secret); return db.convs.filter(c => c.a === m.id || c.b === m.id).map(c => { const o = db.members.find(x => x.id === (c.a === m.id ? c.b : c.a)); const ms = db.msgs.filter(x => x.conv === c.id); return { conversation_id: c.id, autre_id: o.id, autre_nom: o.nom, derniere: c.derniere, apercu: ms[ms.length - 1].texte, non_lus: ms.filter(x => x.from !== m.id && !x.lu).length }; }); },
  rp_thread: a => { const m = need(a.p_secret); const c = db.convs.find(x => x.id === a.p_conversation && (x.a === m.id || x.b === m.id)) || fail("RP_CONV"); const o = db.members.find(x => x.id === (c.a === m.id ? c.b : c.a)); db.msgs.filter(x => x.conv === c.id && x.from !== m.id).forEach(x => { x.lu = true; }); return { autre_id: o.id, autre_nom: o.nom, messages: db.msgs.filter(x => x.conv === c.id).map(x => ({ id: x.id, moi: x.from === m.id, texte: x.texte, cree_le: x.cree_le })) }; },
  rp_update_profile: a => { const m = need(a.p_secret); const p = db.profiles.find(x => x.member_id === m.id) || fail("RP_PROFIL"); if (a.p_nom.trim().length < 2) fail("RP_NOM"); let tel = (a.p_telephone || "").replace(/\D/g, ""); if (tel.length === 8) tel = "236" + tel; Object.assign(p, { nom: a.p_nom, metier: a.p_metier, lieu: a.p_lieu, apropos: a.p_apropos, langues: a.p_langues, telephone: tel || null }); m.nom = a.p_nom; return null; },
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
  const pro = await tel(), cli = await tel();

  await pro.goto(U + "/");
  ok(await vis(pro.getByRole("link", { name: /Que cherches-tu aujourd'hui/ })), "accueil");
  ok(await vis(pro.getByRole("heading", { name: "Kargora" })), "le nom Kargora est affiché dans la carte d'accueil");
  ok(await vis(pro.getByRole("link", { name: "Créer mon compte" })), "carte d'accueil : bouton Créer mon compte (visiteur)");
  ok(await vis(pro.getByRole("link", { name: "Se connecter" })), "carte d'accueil : bouton Se connecter (visiteur)");
  ok(await vis(pro.getByText("Rien pour l'instant")), "état vide : titre rassurant");
  ok(await vis(pro.getByRole("link", { name: "Publier le premier besoin" })), "état vide : vrai bouton Publier le premier besoin");
  await pro.screenshot({ path: SHOT + "/rp5-accueil-vide.png", fullPage: true });
  await pro.getByRole("button", { name: "Offres" }).click();
  ok(await vis(pro.getByText("Aucune annonce dans cette catégorie pour le moment")), "état vide d'une catégorie");
  ok(await vis(pro.getByRole("link", { name: "Publier la première offre" })), "état vide offres : bouton adapté");
  for (const nom of ["Un besoin", "Une offre", "Ma carte"]) ok(await vis(pro.getByRole("link", { name: nom, exact: true }).first()), `raccourci en pilule : ${nom}`);
  // PWA
  const man = await (await pro.request.get(U + "/manifest.webmanifest")).json();
  ok(man.name === "Kargora" && man.short_name === "Kargora" && man.theme_color === "#064e3b" && man.display === "standalone" && man.start_url === "/", "manifeste : nom, couleur, affichage, adresse de départ");
  ok(man.icons.some(i => i.sizes === "192x192") && man.icons.some(i => i.sizes === "512x512") && man.icons.some(i => i.purpose === "maskable"), "manifeste : icônes 192, 512 et maskable");
  for (const i of man.icons) ok((await pro.request.get(U + i.src)).status() === 200, "icône accessible : " + i.src);
  ok((await pro.request.get(U + "/sw.js")).status() === 200 && (await pro.request.get(U + "/offline.html")).status() === 200, "service worker et page hors connexion présents");
  const head = await pro.locator("head").innerHTML();
  ok(/rel="manifest"/.test(head) && /apple-mobile-web-app-title" content="Kargora"/.test(head) && /name="theme-color" content="#064e3b"/.test(head) && /apple-touch-icon/.test(head), "balises Apple, Android et couleur du thème");
  ok(/mobile-web-app-capable|apple-mobile-web-app-capable/.test(head), "balise d'application installable");
  await pro.goto(U + "/a-propos");
  ok(await vis(pro.getByRole("heading", { name: "À propos de Kargora" })), "page À propos");
  ok(await vis(pro.getByText(/Version de test/).first()), "À propos : version de test annoncée");
  ok((await pro.title()).includes("Kargora"), "titre de l'onglet : Kargora");
  await pro.goto(U + "/creer");
  await pro.getByRole("button", { name: "Créer ma carte" }).click();
  ok(await vis(pro.getByText("Écris ton nom")), "erreur : nom vide");
  await pro.fill("#nom", "Joseph Ngaïkosset"); await pro.selectOption("#metier", "Plomberie"); await pro.selectOption("#lieu", "Bégoua");
  await pro.fill("#apropos", "8 ans d'expérience en plomberie et salle de bain.");
  await pro.getByRole("button", { name: "Créer ma carte" }).click();
  await pro.waitForURL(/\/p\/joseph-ngaikosset-/);
  ok(await vis(pro.getByRole("heading", { name: "Joseph Ngaïkosset" })), "carte créée");
  ok(await vis(pro.getByText("Niveau de confiance")), "niveau affiché");
  ok(await pro.getByText(/Appeler/).count() === 0, "numéro caché par défaut");
  ok(await vis(pro.getByRole("button", { name: "Demander une confirmation" })), "bouton de confirmation (propriétaire)");
  ok(await pro.getByRole("link", { name: "Message", exact: true }).count() === 0, "pas de bouton message sur sa propre carte");
  await pro.getByRole("button", { name: "Demander une confirmation" }).click();
  await pro.waitForSelector("text=Lien à envoyer à ton client");
  const lien = (await pro.locator("b", { hasText: "/confirmer/" }).first().innerText()).trim();
  ok(/\/confirmer\/[0-9a-f]{12}$/.test(lien), "lien de confirmation généré : " + lien);
  const slug = pro.url().split("/p/")[1].split("?")[0];
  await pro.screenshot({ path: SHOT + "/rp3-profil.png", fullPage: true });

  // la cliente confirme sur son téléphone, sans inscription
  await cli.goto(lien.replace(/^https?:\/\/[^/]+/, U));
  ok(await vis(cli.getByText(/Joseph Ngaïkosset/).first()), "client : page de confirmation");
  await cli.getByRole("button", { name: "Oui, le travail est fait" }).click();
  ok(await vis(cli.getByText("Dis en quelques mots")), "client : travail obligatoire");
  await cli.fill("#travail", "Plomberie, salle de bain");
  await cli.getByRole("button", { name: "Oui, le travail est fait" }).click();
  ok(await vis(cli.getByText("Choisis une note")), "client : note obligatoire");
  await cli.locator("label", { hasText: /^5$/ }).click();
  await cli.fill("#avis", "Travail propre, ponctuel, prix honnête."); await cli.fill("#prenom", "Claire");
  await cli.getByRole("button", { name: "Oui, le travail est fait" }).click();
  ok(await vis(cli.getByRole("heading", { name: "Merci !" })), "client : confirmation enregistrée");
  await cli.goto(lien.replace(/^https?:\/\/[^/]+/, U));
  ok(await vis(cli.getByRole("heading", { name: "Lien non valable" })), "le lien ne sert qu'une fois");
  await cli.goto(U + "/p/" + slug);
  ok(await vis(cli.getByText(/Travail propre, ponctuel, prix honnête/)), "la carte montre l'avis");
  ok(await vis(cli.getByText(/Claire · chantier confirmé/)), "avis marqué « chantier confirmé »");
  ok(await vis(cli.getByRole("link", { name: "Message", exact: true })), "client : bouton Message");
  await cli.screenshot({ path: SHOT + "/rp3-profil-client.png", fullPage: true });

  // la cliente publie un besoin (elle s'enregistre avec son nom)
  await cli.goto(U + "/besoins/nouveau");
  await cli.getByRole("button", { name: "Publier mon besoin" }).click();
  ok(await vis(cli.getByRole("alert").filter({ hasText: "Écris ton besoin" })), "besoin : erreur titre");
  await cli.fill("#titre", "Plombier demain matin"); await cli.selectOption("#metier", "Plomberie"); await cli.selectOption("#lieu", "Bégoua");
  await cli.fill("#nom", "Claire Mbala");
  await cli.getByRole("button", { name: "Publier mon besoin" }).click();
  await cli.waitForURL(/\/besoins$/);
  ok(await vis(cli.getByText("Plombier demain matin")), "besoin publié");

  // le plombier voit le besoin et répond dans l'application
  await pro.goto(U + "/");
  ok(await vis(pro.getByText("Plombier demain matin")), "pro : voit le besoin sur l'accueil");
  await pro.getByRole("link", { name: "Répondre" }).first().click();
  await pro.waitForURL(/\/messages\/nouveau/);
  ok(await vis(pro.getByText(/Écrire à Claire Mbala/)), "pro : écran d'écriture");
  await pro.fill("#texte", "Bonjour Claire, je suis libre demain à 9 h.");
  await pro.getByRole("button", { name: "Envoyer" }).click();
  await pro.waitForURL(/\/messages\/[0-9a-f-]{36}$/);
  ok(await vis(pro.getByText("Bonjour Claire, je suis libre demain à 9 h.")), "pro : message envoyé dans le fil");

  // la cliente voit le message non lu, répond
  await cli.goto(U + "/");
  ok(await vis(cli.getByRole("link", { name: /Messages, 1 non lus/ })), "cliente : compteur de messages non lus");
  await cli.goto(U + "/messages");
  ok(await vis(cli.getByText("Joseph Ngaïkosset").first()), "cliente : boîte de réception");
  await cli.getByRole("link", { name: /Joseph Ngaïkosset/ }).first().click();
  ok(await vis(cli.getByText("Bonjour Claire, je suis libre demain à 9 h.")), "cliente : lit le message");
  await cli.fill("#texte", "Parfait, merci !");
  await cli.getByRole("button", { name: "Envoyer" }).click();
  ok(await vis(cli.getByText("Parfait, merci !")), "cliente : réponse affichée");
  await cli.screenshot({ path: SHOT + "/rp3-fil.png" });
  await pro.goto(U + "/messages");
  ok(await vis(pro.getByText("Parfait, merci !")), "pro : reçoit la réponse");

  // offre d'emploi, recherche
  await cli.goto(U + "/emplois/nouveau");
  await cli.fill("#titre", "Comptable junior"); await cli.fill("#organisation", "Organisation exemple");
  await cli.selectOption("#type", "CDD"); await cli.selectOption("#lieu", "Bangui centre");
  await cli.getByRole("button", { name: "Publier l'offre" }).click();
  await cli.waitForURL(/\/emplois$/);
  ok(await vis(cli.getByText("Comptable junior")), "offre publiée");
  ok(await vis(cli.getByText(/Méfie-toi de toute offre/)), "avertissement anti-arnaque");
  await cli.goto(U + "/chercher?m=Plomberie");
  ok(await vis(cli.getByText("Joseph Ngaïkosset")), "recherche : trouvé");
  ok(await vis(cli.getByText(/1 chantier confirmé/)), "recherche : chantier confirmé affiché");
  await cli.selectOption("#l", "PK5");
  ok(await vis(cli.getByText(/Aucun professionnel/)), "recherche : autre quartier vide");


  // compte, page Moi, paramètres, connexion par code, modification de la carte
  const nouv = await tel();
  await nouv.goto(U + "/");
  ok(await vis(nouv.getByRole("link", { name: "Créer mon compte" })), "visiteur : « Créer mon compte » sur l'accueil");
  ok(await vis(nouv.getByRole("link", { name: "Se connecter" })), "visiteur : « Se connecter » sur l'accueil");
  await nouv.goto(U + "/moi");
  ok(await vis(nouv.getByText("Tu n'es pas connecté(e) sur ce téléphone.")), "Moi sans compte : invitation à se connecter");
  await nouv.goto(U + "/inscription");
  await nouv.getByRole("button", { name: "Créer mon compte" }).click();
  ok(await vis(nouv.getByRole("alert").filter({ hasText: "Écris ton nom" })), "inscription : nom obligatoire");
  await nouv.fill("#nom", "Marie Kette");
  await nouv.getByRole("button", { name: "Créer mon compte" }).click();
  ok(await vis(nouv.getByRole("alert").filter({ hasText: "Coche la case" })), "inscription : case à cocher obligatoire");
  await nouv.getByLabel(/J'ai lu/).check();
  await nouv.getByRole("button", { name: "Créer mon compte" }).click();
  await nouv.waitForURL(/\/moi\?bienvenue=1/);
  ok(await vis(nouv.getByRole("heading", { name: "Marie Kette" })), "Moi : le nom s'affiche");
  ok(await vis(nouv.getByText("Compte créé.")), "Moi : message de bienvenue");
  ok(await vis(nouv.getByRole("link", { name: "Créer ma carte pro" })), "Moi : invitation à créer sa carte");
  await nouv.screenshot({ path: SHOT + "/rp4-moi.png", fullPage: true });
  await nouv.goto(U + "/parametres");
  ok(await vis(nouv.getByRole("heading", { name: "Paramètres" })), "page Paramètres");
  await nouv.getByRole("button", { name: "Afficher mon code" }).click();
  const code = (await nouv.getByLabel("Mon code de connexion").innerText()).trim();
  ok(/^([0-9a-f]{6} ){11}[0-9a-f]{6}$/.test(code), "le code est affiché par groupes de 6 : " + code.slice(0, 20) + "…");
  await nouv.getByRole("button", { name: "Quitter ce téléphone" }).click();
  ok(await vis(nouv.getByText(/Sans ton code de connexion/)), "quitter : avertissement avant d'effacer");
  await nouv.getByRole("button", { name: "Oui, quitter" }).click();
  await nouv.waitForURL(U + "/");
  ok(await vis(nouv.getByRole("link", { name: "Créer mon compte" })), "après avoir quitté : on revient visiteur");
  await nouv.goto(U + "/connexion");
  await nouv.fill("#code", "0000 abcd");
  await nouv.getByRole("button", { name: "Se connecter" }).click();
  ok(await vis(nouv.getByRole("alert").filter({ hasText: "Code non reconnu" })), "connexion : mauvais code refusé");
  await nouv.fill("#code", code);
  await nouv.getByRole("button", { name: "Se connecter" }).click();
  await nouv.waitForURL(/\/moi$/);
  ok(await vis(nouv.getByRole("heading", { name: "Marie Kette" })), "connexion avec le code : compte retrouvé");

  // modifier sa carte
  await nouv.goto(U + "/creer");
  await nouv.fill("#nom", "Marie Kette"); await nouv.selectOption("#metier", "Couture et mode"); await nouv.selectOption("#lieu", "PK5");
  await nouv.getByRole("button", { name: "Créer ma carte" }).click();
  await nouv.waitForURL(/\/p\/marie-kette-/);
  await nouv.goto(U + "/moi");
  ok(await vis(nouv.getByRole("link", { name: "Modifier" })), "Moi : bouton Modifier la carte");
  await nouv.getByRole("link", { name: "Modifier" }).click();
  await nouv.waitForURL(/\/moi\/carte/);
  await nouv.selectOption("#metier", "Coiffure et beauté");
  await nouv.fill("#apropos", "Couture et coiffure, 5 ans d'expérience à PK5.");
  await nouv.getByRole("button", { name: "Enregistrer" }).click();
  await nouv.waitForURL(/\/p\/marie-kette-/);
  ok(await vis(nouv.getByText("Coiffure et beauté").first()), "la carte montre le nouveau métier");
  ok(await vis(nouv.getByText(/Niveau 2/).first()), "la carte passe au niveau 2 après la présentation");

  // aucun renvoi vers WhatsApp nulle part
  let wa = 0;
  for (const u of ["/", "/creer", "/chercher", "/publier", "/besoins", "/emplois", "/messages", "/p/" + slug]) { await cli.goto(U + u); await cli.waitForTimeout(300); wa += (await cli.content()).includes("wa.me") ? 1 : 0; }
  ok(wa === 0, "aucun lien vers WhatsApp");
  await cli.goto(U + "/"); await cli.waitForTimeout(500);
  await cli.screenshot({ path: SHOT + "/rp3-accueil.png", fullPage: true });
  ok(log.length === 0, "noms de paramètres conformes aux fonctions : " + JSON.stringify(log));
  ok(errs.length === 0, "aucune erreur navigateur " + JSON.stringify(errs));
  await b.close();
  console.log(fails ? `${fails} ÉCHEC(S)` : "TOUT PASSE");
})();
