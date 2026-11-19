import Link from "next/link";

export const metadata = { title: "À propos de Kargora et confidentialité" };

export default function APropos() {
  return (
    <main className="page">
      <section className="carte"><div className="in">
        <h1>À propos de Kargora</h1>
        <p className="lead">Kargora aide à trouver quelqu&apos;un de confiance : des professionnels dont les clients ont confirmé le travail, des besoins, des offres d&apos;emploi, et des messages dans l&apos;application.</p>
        <p className="info"><b>Version de test.</b> Kargora est en phase de test. Des choses peuvent changer, être lentes ou ne pas marcher. Aucune vérification d&apos;identité n&apos;existe encore : les niveaux « identité vérifiée » et « entreprise déclarée » sont annoncés pour plus tard, et aucune offre d&apos;emploi n&apos;est contrôlée.</p>
      </div></section>
      <section className="carte"><div className="in">
        <h2>Ce que nous gardons</h2>
        <p>Quand tu crées une carte : ton nom, ton métier, ton quartier, ta présentation, tes langues, et ton numéro seulement si tu choisis de le montrer. Quand tu publies un besoin ou une offre : son contenu. Quand tu écris : tes messages. Quand un client confirme un travail : sa note, ses mots et son prénom s&apos;il le donne.</p>
        <p style={{ marginTop: 8 }}>Il n&apos;y a pas de mot de passe. Un secret aléatoire est gardé sur ton téléphone et nous n&apos;en gardons que l&apos;empreinte. Les cartes, besoins et offres sont visibles par tout le monde. Les messages ne sont visibles que par les deux personnes.</p>
      </div></section>
      <section className="carte"><div className="in">
        <h2>Ce qu&apos;il faut savoir</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>Si tu perds ou changes de téléphone, tu perds l&apos;accès à ta carte. Une récupération sera ajoutée plus tard.</li>
          <li>La suppression d&apos;une carte n&apos;est pas encore disponible dans cette version.</li>
          <li>Les avis sont publiés tels quels, retirés seulement s&apos;ils sont faux ou injurieux, avec une explication. Personne ne peut payer pour les faire disparaître.</li>
          <li>Kargora ne détient pas ton argent et ne garantit aucun travail : les accords se font entre les personnes.</li>
          <li>Ne partage jamais un mot de passe, un code ou un numéro de carte, ni dans les messages ni dans une annonce. Une vraie offre d&apos;emploi ne demande jamais d&apos;argent.</li>
        </ul>
      </div></section>
      <p style={{ padding: "0 4px" }}><Link className="btn" href="/">Retour à l&apos;accueil</Link></p>
    </main>
  );
}
