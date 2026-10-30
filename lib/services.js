export const SERVICES = [
  { id: "netflix", name: "Netflix", text: "Aide à l'abonnement et au renouvellement, selon les modalités autorisées par la plateforme." },
  { id: "spotify", name: "Spotify", text: "Abonnements, renouvellements et cartes cadeaux compatibles." },
  { id: "canva", name: "Canva", text: "Abonnements et offres professionnelles de design." },
  { id: "playstation", name: "PlayStation", text: "Cartes cadeaux et crédits numériques officiels." },
  { id: "apple", name: "Apple", text: "Cartes cadeaux et crédits compatibles avec la région du compte." },
  { id: "google_play", name: "Google Play", text: "Cartes cadeaux et codes numériques compatibles." },
];
export const OTHER_SERVICES = [
  { id: "logiciel", name: "Logiciels et licences" },
  { id: "domaine", name: "Domaines et hébergement web" },
  { id: "carte_cadeau", name: "Autre carte cadeau numérique" },
  { id: "jeu", name: "Crédits de jeux" },
  { id: "paiement", name: "Paiement d'un service en ligne (si le fournisseur l'autorise)" },
  { id: "autre", name: "Autre demande de service" },
];
export const SERVICE_NAME = Object.fromEntries([...SERVICES, ...OTHER_SERVICES].map((s) => [s.id, s.name]));
export const OPERATIONS = ["Nouvel abonnement", "Renouvellement", "Carte cadeau", "Code / crédit numérique", "Service spécial"];
