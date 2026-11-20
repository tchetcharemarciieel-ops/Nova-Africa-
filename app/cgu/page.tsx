import Pied from "@/components/Pied";

export const metadata = { title: "Conditions d'utilisation" };

export default function Cgu() {
  return (
    <main className="page legal">
      <section className="carte"><div className="in">
        <h1>Conditions d&apos;utilisation</h1>
        <p className="lead">En utilisant Kargora, tu acceptes ces règles.</p>
        <h2>Fausses offres d&apos;emploi : tolérance zéro</h2>
        <ul>
          <li>Seules les entreprises et ONG inscrites peuvent publier une offre d&apos;emploi.</li>
          <li><b>Une vraie offre ne demande jamais d&apos;argent</b> au candidat (frais de dossier, de visa, de formation…). Toute offre qui en demande est supprimée et son auteur exclu.</li>
          <li>Une offre doit correspondre à un vrai poste de l&apos;entreprise ou de l&apos;organisation qui la publie.</li>
          <li>Tu peux signaler une offre suspecte depuis la page Contact.</li>
        </ul>
        <h2>Avis et chantiers confirmés</h2>
        <p>Un chantier compte seulement quand un vrai client le confirme avec le lien envoyé par le professionnel. Les avis sont publiés tels quels et retirés seulement s&apos;ils sont faux, injurieux ou publiés par le professionnel lui-même ; nous disons pourquoi. Personne ne peut payer pour les faire disparaître.</p>
        <h2>Ton contenu</h2>
        <ul>
          <li>Publie uniquement tes propres réalisations et des informations exactes.</li>
          <li>Pas de contenu violent, haineux, trompeur, ni de photo d&apos;une personne sans son accord.</li>
          <li>Nous pouvons retirer un contenu et exclure un compte qui ne respecte pas ces règles.</li>
        </ul>
        <h2>Ce que Kargora n&apos;est pas</h2>
        <p>Kargora met des personnes en relation. Nous ne détenons pas d&apos;argent, nous ne sommes pas partie aux accords de travail ni de paiement, et nous ne garantissons ni un emploi, ni la qualité d&apos;un travail, ni une entreprise, même vérifiée.</p>
        <h2>Ton compte</h2>
        <p>Tu es responsable de ton code de connexion. Un compte par personne ou par structure.</p>
      </div></section>
      <Pied />
    </main>
  );
}
