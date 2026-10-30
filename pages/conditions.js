import Layout from "../components/Layout";

export default function Conditions() {
  return (
    <Layout title="Conditions et confidentialité" hero={{ eyebrow: "Informations légales", title: "Conditions et confidentialité", sub: "Commande, paiement, annulation, services numériques et données personnelles." }}>
      <section className="block"><div className="wrap">
        <p className="notice">Version de travail du lancement. Ces textes doivent être relus et validés par un conseil juridique avant l&apos;ouverture commerciale.</p>
        <h3 className="mt">Commande</h3>
        <p>L&apos;envoi d&apos;une demande ne constitue pas une commande. Une commande n&apos;est lancée qu&apos;après acceptation explicite d&apos;un devis par le client et confirmation du paiement par KARGORA.</p>
        <h3>Devis et prix</h3>
        <p>Un devis est valable jusqu&apos;à sa date de validité. Il indique si le total est estimatif ou confirmé. Les droits et taxes douaniers sont une estimation tant qu&apos;ils ne sont pas confirmés selon la classification du produit.</p>
        <h3>Paiement</h3>
        <p>Les instructions de paiement sont communiquées uniquement après acceptation du devis. Un paiement n&apos;est confirmé qu&apos;après vérification par KARGORA ; une capture d&apos;écran ne suffit pas. Un reçu est remis pour chaque paiement. Aucun solde ni portefeuille n&apos;est tenu au nom du client.</p>
        <h3>Annulation et remboursement</h3>
        <p>Avant l&apos;achat, la commande peut être annulée et le paiement remboursé. Après l&apos;achat, les conditions dépendent de celles du fournisseur et seront précisées dans le devis. <em>(À compléter après validation juridique.)</em></p>
        <h3>Services numériques</h3>
        <p>Les services numériques (abonnements, renouvellements, cartes cadeaux, crédits) sont réalisés sur devis, auprès de fournisseurs autorisés et dans le respect des conditions et restrictions géographiques de chaque plateforme. KARGORA ne vend ni compte partagé ni code d&apos;origine douteuse et ne demande jamais de mot de passe. Une opération numérique effectuée ne peut en principe pas être annulée ni remboursée : les conditions exactes seront précisées dans le devis. <em>(À valider juridiquement.)</em></p>
        <h3>Transport et retrait</h3>
        <p>Le retrait à Bangui est l&apos;option principale. Les délais sont estimatifs et dépendent des transporteurs partenaires. La responsabilité de KARGORA débute à la réception du colis chez le partenaire logistique. <em>(À préciser.)</em></p>
        <h3>Données personnelles</h3>
        <p>Nous collectons votre nom, téléphone, les détails de votre demande et les fichiers que vous joignez, uniquement pour traiter votre demande et vous contacter. Ces données ne sont jamais affichées publiquement, ne sont pas vendues, et sont accessibles à l&apos;équipe KARGORA habilitée. Pour consulter ou supprimer vos données, contactez-nous.</p>
      </div></section>
    </Layout>
  );
}
