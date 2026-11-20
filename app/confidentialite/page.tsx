import Pied from "@/components/Pied";

export const metadata = { title: "Politique de confidentialité" };

export default function Confidentialite() {
  return (
    <main className="page legal">
      <section className="carte"><div className="in">
        <h1>Politique de confidentialité</h1>
        <p className="lead">Voici ce que Kargora garde sur toi, qui peut le voir, et ce que tu peux faire.</p>
        <h2>Ce que nous gardons</h2>
        <ul>
          <li><b>Profil professionnel</b> : nom, quartier ou ville, métier, présentation, langues, photo de profil, parcours, photos de réalisations avec leurs légendes.</li>
          <li><b>Entreprise ou ONG</b> : nom, secteur, adresse, logo, présentation, et pour la vérification le numéro RCCM, le numéro NIF (ou l&apos;agrément) et le nom et le téléphone WhatsApp du responsable RH.</li>
          <li><b>Activité</b> : tes publications, besoins, offres, messages, et les chantiers confirmés par tes clients.</li>
        </ul>
        <h2>Qui peut le voir</h2>
        <ul>
          <li><b>Public</b> : ton profil, tes photos, tes publications, la page de ton entreprise et ses offres.</li>
          <li><b>Jamais publics</b> : le numéro RCCM, le numéro NIF ou d&apos;agrément, le téléphone du responsable RH. Ils ne servent qu&apos;à la vérification et ne sont vus que par l&apos;équipe Kargora.</li>
          <li><b>Ton numéro WhatsApp</b> reste caché, sauf si tu choisis de le montrer sur ta carte.</li>
          <li><b>Tes messages</b> ne sont visibles que par les deux personnes de la conversation.</li>
        </ul>
        <h2>Tes photos</h2>
        <p>Les images sont réduites dans ton téléphone avant l&apos;envoi, puis enregistrées avec ton profil. N&apos;envoie pas de photo d&apos;une autre personne sans son accord, ni de pièce d&apos;identité. Tu peux supprimer une photo de ta galerie à tout moment.</p>
        <h2>Pas de mot de passe</h2>
        <p>Un code secret est gardé sur ton téléphone ; nous n&apos;en gardons que l&apos;empreinte. Ne le partage jamais : il donne accès à ton compte. Si tu le perds, nous ne pouvons pas le retrouver pour le moment.</p>
        <h2>Tes droits</h2>
        <p>La suppression d&apos;un compte n&apos;est pas encore disponible dans l&apos;application : écris-nous depuis la page Contact et nous le supprimons. Nous ne vendons aucune donnée.</p>
      </div></section>
      <Pied />
    </main>
  );
}
