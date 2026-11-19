// Parcours complet dans un navigateur : lancer `npx next start -p 3100` puis `node tests/parcours.cjs` (Playwright requis).
const { chromium } = require("playwright");
const S = "/tmp";
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", e => errs.push("pageerror: " + e.message));
  p.on("console", m => { if (m.type() === "error") errs.push("console: " + m.text()); });
  let fails = 0;
  const ok = (c, msg) => { console.log((c ? "OK  " : "FAIL") + " " + msg); if (!c) { fails++; process.exitCode = 1; } };
  const U = "http://localhost:3100";
  const vis = loc => loc.waitFor({ state: "visible", timeout: 4000 }).then(() => true).catch(() => false);

  await p.goto(U + "/");
  ok(await p.getByRole("heading", { name: /Trouve quelqu'un de confiance/ }).isVisible(), "accueil");
  ok(await p.getByText(/Aucun besoin publié/).isVisible(), "accueil : état vide des besoins");
  await p.getByRole("link", { name: "regarde un exemple" }).click();
  await p.waitForURL(/\/exemple/);
  ok(await p.getByText("Joseph Exemple").first().isVisible(), "exemple affiché");
  ok(await p.getByText(/Cette personne n'existe pas/).isVisible(), "exemple clairement marqué");
  ok(await p.getByText("Salle de bain").count() >= 0, "exemple ok");
  await p.screenshot({ path: S + "/rp2-exemple.png", fullPage: true });

  await p.goto(U + "/creer");
  await p.getByRole("button", { name: "Créer ma carte" }).click();
  ok(await p.getByText("Écris ton nom").isVisible(), "erreur nom vide");
  await p.fill("#nom", "Joseph Ngaïkosset");
  await p.selectOption("#metier", "Plomberie");
  await p.selectOption("#lieu", "Bégoua");
  await p.fill("#telephone", "70 12 34 56");
  await p.fill("#apropos", "8 ans d'expérience en plomberie et salle de bain.");
  await p.getByRole("button", { name: "Créer ma carte" }).click();
  await p.waitForURL(/\/p\/joseph-ngaikosset-/);
  ok(await p.getByRole("heading", { name: "Joseph Ngaïkosset" }).isVisible(), "carte créée");
  ok(await p.getByText(/Niveau 2 sur 4/).isVisible(), "niveau 2 (profil complet) honnête");
  ok(await p.getByText(/identité vérifiée, entreprise déclarée \(bientôt\)/).isVisible(), "niveaux 3 et 4 marqués bientôt");
  ok(await p.getByText("chantiers confirmés").first().isVisible(), "compteur de chantiers");
  await p.waitForSelector("img[alt^='QR code']");
  ok(true, "QR code généré");
  ok((await p.getByRole("link", { name: "WhatsApp", exact: true }).getAttribute("href")).startsWith("https://wa.me/23670123456"), "lien WhatsApp");
  ok(await p.getByRole("link", { name: "Demander une confirmation" }).isVisible(), "demande de confirmation (propriétaire)");
  const url = p.url().split("?")[0];
  await p.screenshot({ path: S + "/rp2-carte.png", fullPage: true });

  // le client confirme
  const slug = url.split("/p/")[1];
  await p.goto(U + "/confirmer/" + slug);
  await p.getByRole("button", { name: "Oui, le travail est fait" }).click();
  ok(await p.getByText("Dis en quelques mots").isVisible(), "confirmation : travail obligatoire");
  await p.fill("#travail", "Plomberie, salle de bain");
  await p.getByRole("button", { name: "Oui, le travail est fait" }).click();
  ok(await p.getByText("Choisis une note").isVisible(), "confirmation : note obligatoire");
  await p.locator("label", { hasText: "5" }).first().click();
  await p.fill("#avis", "Travail propre, ponctuel, prix honnête.");
  await p.fill("#prenom", "Claire");
  await p.getByRole("button", { name: "Oui, le travail est fait" }).click();
  ok(await p.getByRole("heading", { name: "Merci !" }).isVisible(), "confirmation enregistrée");
  await p.goto(url);
  ok(await vis(p.getByText(/Travail propre, ponctuel, prix honnête/).first()), "avis visible sur la carte");
  ok(await p.getByText(/Claire · chantier confirmé/).isVisible(), "avis marqué chantier confirmé");
  await p.screenshot({ path: S + "/rp2-carte-avis.png", fullPage: true });

  // besoin
  await p.goto(U + "/besoins/nouveau");
  await p.getByRole("button", { name: "Publier mon besoin" }).click();
  ok(await p.getByRole("alert").filter({ hasText: "Écris ton besoin" }).isVisible(), "besoin : erreur titre");
  await p.fill("#titre", "Plombier demain matin");
  await p.selectOption("#metier", "Plomberie"); await p.selectOption("#lieu", "Bégoua");
  await p.fill("#telephone", "75 00 11 22");
  await p.getByRole("button", { name: "Publier mon besoin" }).click();
  await p.waitForURL(/\/besoins$/);
  ok(await vis(p.getByText("Plombier demain matin").first()), "besoin publié");
  ok((await p.getByRole("link", { name: "Répondre" }).first().getAttribute("href")).includes("wa.me/23675001122"), "lien répondre");

  // offre
  await p.goto(U + "/emplois/nouveau");
  await p.fill("#titre", "Comptable junior"); await p.fill("#organisation", "Organisation exemple");
  await p.selectOption("#type", "CDD"); await p.selectOption("#lieu", "Bangui centre"); await p.fill("#telephone", "72 33 44 55");
  await p.getByRole("button", { name: "Publier l'offre" }).click();
  await p.waitForURL(/\/emplois$/);
  ok(await vis(p.getByText("Comptable junior").first()), "offre publiée");
  ok(await p.getByText(/ne demande jamais d'argent|méfie-toi de toute offre/).first().isVisible(), "avertissement anti-arnaque emploi");

  // recherche
  await p.goto(U + "/chercher?m=Plomberie");
  ok(await vis(p.getByText("Joseph Ngaïkosset").first()), "recherche : trouvé");
  ok(await vis(p.getByText(/1 chantier confirmé/)), "recherche : chantier confirmé affiché");
  await p.selectOption("#l", "PK5");
  ok(await vis(p.getByText(/Aucun professionnel/)), "recherche : autre quartier vide");

  // accueil rempli
  await p.goto(U + "/");
  ok(await vis(p.getByText("Plombier demain matin").first()), "accueil : besoin affiché");
  ok(await vis(p.getByText("Joseph Ngaïkosset").first()), "accueil : professionnel affiché");
  await p.screenshot({ path: S + "/rp2-accueil.png", fullPage: true });

  await p.goto(U + "/p/inconnu-zzzz");
  ok(await p.getByRole("heading", { name: "Carte introuvable" }).isVisible(), "carte inconnue");
  ok(errs.length === 0, "aucune erreur navigateur " + JSON.stringify(errs));
  await b.close();
  console.log(fails ? `${fails} ÉCHEC(S)` : "TOUT PASSE");
})();
