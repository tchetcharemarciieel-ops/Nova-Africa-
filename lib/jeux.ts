// Mini-jeux quotidiens de réflexion pro. Un score par jeu et par jour (jour de Bangui), gardé sur le téléphone puis envoyé au profil.
export type Jeu = "lien" | "grille" | "quiz";
export const JEUX: { id: Jeu; nom: string; href: string; texte: string }[] = [
  { id: "lien", nom: "Le Lien Pro", href: "/jeux/lien-pro", texte: "Trouve ce qui relie trois mots du monde du travail." },
  { id: "grille", nom: "Grille Logique", href: "/jeux/grille", texte: "Remplis la grille 4 × 4 : un chiffre par ligne, colonne et bloc." },
  { id: "quiz", nom: "Quiz Business", href: "/jeux/quiz", texte: "5 questions sur la gestion, la vente et l'emploi." },
];

/** Jour de Bangui (UTC+1), au format AAAA-MM-JJ. */
export const jourBangui = (t = Date.now()) => new Date(t + 3600000).toISOString().slice(0, 10);

function graine(s: string) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
export function aleatoire(seed: string) { let a = graine(seed); return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function melanger<T>(l: T[], r: () => number): T[] { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// ---- Scores sur le téléphone
const CLE = "kargora.jeux";
type Scores = Record<string, Partial<Record<Jeu, number>>>;
export function lireScores(): Scores { try { return JSON.parse(localStorage.getItem(CLE) || "{}") as Scores; } catch { return {}; } }
export function scoreDuJour(jeu: Jeu, jour = jourBangui()): number | null { const v = lireScores()[jour]?.[jeu]; return typeof v === "number" ? v : null; }
export function enregistrer(jeu: Jeu, points: number, jour = jourBangui()) {
  const s = lireScores(); const j = s[jour] || {};
  if (typeof j[jeu] === "number") return; // un seul score par jeu et par jour
  s[jour] = { ...j, [jeu]: Math.max(0, Math.min(100, Math.round(points))) };
  try { localStorage.setItem(CLE, JSON.stringify(s)); } catch { /* ignore */ }
}
export function resume() {
  const s = lireScores(); let total = 0; let jours = 0;
  for (const j of Object.values(s)) { const v = Object.values(j).filter((x): x is number => typeof x === "number"); if (v.length) { jours++; total += v.reduce((a, b) => a + b, 0); } }
  let serie = 0; const d = new Date(Date.now() + 3600000);
  if (!Object.keys(s[d.toISOString().slice(0, 10)] || {}).length) d.setUTCDate(d.getUTCDate() - 1);
  while (Object.keys(s[d.toISOString().slice(0, 10)] || {}).length) { serie++; d.setUTCDate(d.getUTCDate() - 1); }
  return { total, jours, serie };
}

// ---- Le Lien Pro
export const LIENS: [string[], string][] = [
  [["Maçon", "Plombier", "Électricien"], "Les métiers du bâtiment"], [["Devis", "Facture", "Reçu"], "Les documents commerciaux"],
  [["CV", "Lettre de motivation", "Entretien"], "Chercher un emploi"], [["Stock", "Inventaire", "Fournisseur"], "La gestion des marchandises"],
  [["Bilan", "Compte de résultat", "Journal"], "La comptabilité"], [["Ciment", "Sable", "Gravier"], "Fabriquer du béton"],
  [["Photo", "Vidéo", "Montage"], "La création de contenu"], [["Livreur", "Chauffeur", "Moto-taxi"], "Le transport et la livraison"],
  [["Semences", "Récolte", "Engrais"], "L'agriculture"], [["Stage", "CDD", "CDI"], "Les types de contrat"],
  [["Diplôme", "Attestation", "Certificat"], "Les preuves de formation"], [["Tissu", "Mètre ruban", "Machine à coudre"], "La couture"],
  [["Salaire", "Prime", "Congé"], "La rémunération et les avantages"], [["WhatsApp", "E-mail", "Appel"], "Les moyens de contact"],
  [["Marge", "Coût", "Prix de vente"], "Le calcul du bénéfice"], [["Mentor", "Conseil", "Réseau"], "Le développement professionnel"],
  [["Ordinateur", "Logiciel", "Internet"], "Le numérique"], [["Médecin", "Infirmier", "Pharmacien"], "Les métiers de la santé"],
  [["Enseignant", "Cours", "Élève"], "L'éducation"], [["Prospect", "Client", "Vente"], "Le commerce"],
];
export type Question = { q: string; options: string[]; bonne: number; aide?: string };
export function questionsLien(jour: string): Question[] {
  const r = aleatoire("lien" + jour); const pick = melanger(LIENS, r).slice(0, 5);
  return pick.map(([mots, rep]) => {
    const faux = melanger(LIENS.map(l => l[1]).filter(x => x !== rep), r).slice(0, 3);
    const opts = melanger([rep, ...faux], r);
    return { q: `Quel lien entre « ${mots.join(" », « ")} » ?`, options: opts, bonne: opts.indexOf(rep), aide: `Ces trois mots parlent de : ${rep.toLowerCase()}.` };
  });
}

// ---- Quiz Business
const QUIZ: { q: string; bonne: string; faux: string[]; aide: string }[] = [
  { q: "Tu achètes à 500 FCFA et tu revends à 650 FCFA. Quelle est ta marge ?", bonne: "150 FCFA", faux: ["500 FCFA", "650 FCFA", "1 150 FCFA"], aide: "Marge = prix de vente − coût = 650 − 500." },
  { q: "Un devis, c'est…", bonne: "Une estimation de prix donnée avant le travail", faux: ["Un reçu après paiement", "Un contrat de travail", "Un diplôme"], aide: "Le devis dit le prix prévu, avant de commencer." },
  { q: "Que faut-il séparer pour bien gérer une petite entreprise ?", bonne: "L'argent de l'entreprise et l'argent personnel", faux: ["Les clients et les fournisseurs", "Le matin et le soir", "Les prix et les produits"], aide: "Mélanger les deux empêche de voir si l'activité gagne vraiment de l'argent." },
  { q: "Le chiffre d'affaires, c'est…", bonne: "Le total des ventes sur une période", faux: ["Le bénéfice net", "Le salaire du patron", "Le prix d'un seul produit"], aide: "C'est ce qui est vendu, avant de retirer les coûts." },
  { q: "Bénéfice =", bonne: "Ventes − coûts", faux: ["Ventes + coûts", "Coûts − ventes", "Ventes × coûts"], aide: "Ce qu'il reste une fois les coûts payés." },
  { q: "Un acompte, c'est…", bonne: "Une partie du prix payée avant le travail", faux: ["Une amende", "Le prix total payé après", "Un cadeau au client"], aide: "L'acompte engage le client et aide à acheter les matériaux." },
  { q: "Le RCCM est…", bonne: "Le registre où sont enregistrés les commerçants et les sociétés", faux: ["Un impôt", "Un diplôme", "Un compte bancaire"], aide: "Registre du Commerce et du Crédit Mobilier." },
  { q: "Le NIF sert à…", bonne: "Identifier une entreprise ou une personne pour les impôts", faux: ["Voter", "Voyager", "Recevoir des messages"], aide: "NIF = Numéro d'Identification Fiscale." },
  { q: "Si le coût d'achat monte et que ton prix de vente ne change pas, ton bénéfice…", bonne: "Baisse", faux: ["Monte", "Reste identique", "Double"], aide: "La même vente rapporte moins quand le coût augmente." },
  { q: "Une vraie offre d'emploi demande au candidat…", bonne: "De répondre avec son CV, jamais de payer", faux: ["De payer des frais de dossier", "D'envoyer sa carte bancaire", "D'acheter une formation obligatoire"], aide: "Toute offre qui demande de l'argent est une arnaque." },
  { q: "Un portfolio, c'est…", bonne: "Un ensemble de réalisations qui montrent ton travail", faux: ["Une liste de prix", "Un carnet d'adresses", "Un contrat"], aide: "Des photos de chantiers valent mieux que de longues phrases." },
  { q: "Prospecter, c'est…", bonne: "Chercher de nouveaux clients", faux: ["Payer ses impôts", "Compter son stock", "Faire sa comptabilité"], aide: "Sans prospection, l'activité s'arrête quand les clients partent." },
  { q: "La trésorerie, c'est…", bonne: "L'argent disponible pour payer les dépenses du moment", faux: ["Le stock de marchandises", "La liste des clients", "Le local de l'entreprise"], aide: "On peut vendre beaucoup et manquer de trésorerie si les clients paient tard." },
  { q: "Pour fidéliser un client, le plus important est…", bonne: "Un travail de qualité et des délais tenus", faux: ["Un prix toujours plus haut", "De ne jamais répondre", "De changer de numéro"], aide: "Un client satisfait revient et te recommande." },
  { q: "Un fournisseur, c'est…", bonne: "Quelqu'un qui te vend ce dont tu as besoin pour ton activité", faux: ["Un client", "Un concurrent", "Un banquier"], aide: "Par exemple celui qui vend le ciment à un maçon." },
  { q: "Une facture sert à…", bonne: "Demander et prouver un paiement pour une vente", faux: ["Chercher un emploi", "Décorer le magasin", "Faire de la publicité"], aide: "Elle détaille ce qui a été vendu et le montant dû." },
  { q: "Un inventaire, c'est…", bonne: "Compter ce que tu as réellement en stock", faux: ["Une réunion", "Un type de contrat", "Une promotion"], aide: "Il permet de repérer les pertes et de savoir quoi recommander." },
  { q: "Un CDD est un contrat…", bonne: "À durée déterminée", faux: ["À durée indéterminée", "De stage non payé", "Sans employeur"], aide: "CDD = Contrat à Durée Déterminée. CDI = indéterminée." },
];
export function questionsQuiz(jour: string): Question[] {
  const r = aleatoire("quiz" + jour);
  return melanger(QUIZ, r).slice(0, 5).map(x => { const opts = melanger([x.bonne, ...x.faux], r); return { q: x.q, options: opts, bonne: opts.indexOf(x.bonne), aide: x.aide }; });
}

// ---- Grille Logique (sudoku 4 × 4 à solution unique)
export type Grille = number[][]; // 0 = case vide
const BASE: Grille = [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]];
function compter(g: Grille, limite = 2): number {
  const v = (r: number, c: number, n: number) => { for (let i = 0; i < 4; i++) { if (g[r][i] === n || g[i][c] === n) return false; } const br = r - (r % 2), bc = c - (c % 2); for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) if (g[br + i][bc + j] === n) return false; return true; };
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (g[r][c] === 0) { let t = 0; for (let n = 1; n <= 4; n++) if (v(r, c, n)) { g[r][c] = n; t += compter(g, limite - t); g[r][c] = 0; if (t >= limite) return t; } return t; }
  return 1;
}
export function grilleDuJour(jour: string): { puzzle: Grille; solution: Grille } {
  const r = aleatoire("grille" + jour);
  const chiffres = melanger([1, 2, 3, 4], r);
  let sol = BASE.map(l => l.map(n => chiffres[n - 1]));
  const ordre = (a: number[][]) => { const bandes = melanger([0, 1], r); const rows = bandes.flatMap(b => melanger([b * 2, b * 2 + 1], r)); return rows.map(i => a[i]); };
  sol = ordre(sol); sol = ordre(sol[0].map((_, c) => sol.map(l => l[c]))); sol = sol[0].map((_, c) => sol.map(l => l[c]));
  const puzzle = sol.map(l => [...l]);
  for (const k of melanger(Array.from({ length: 16 }, (_, i) => i), r)) {
    const a = Math.floor(k / 4), b = k % 4, old = puzzle[a][b]; puzzle[a][b] = 0;
    if (compter(puzzle.map(l => [...l])) !== 1) puzzle[a][b] = old;
    if (puzzle.flat().filter(x => x === 0).length >= 9) break;
  }
  return { puzzle, solution: sol };
}
