import Link from "next/link";
import Layout from "../components/Layout";

const STEPS = [
  ["Demande", "Vous remplissez le formulaire et recevez un numéro de demande. Ce n'est pas une commande payée."],
  ["Vérification", "Nous vérifions le produit, le fournisseur et les possibilités de transport."],
  ["Devis", "Nous vous envoyons un devis détaillé en FCFA, avec sa durée de validité. Vous l'acceptez ou le refusez."],
  ["Paiement", "Après acceptation, les instructions de paiement s'affichent. Nous confirmons le paiement nous-mêmes après vérification, puis nous remettons un reçu."],
  ["Achat", "Nous achetons le produit auprès du fournisseur."],
  ["Transport", "Le colis est reçu chez notre partenaire logistique, expédié, puis dédouané."],
  ["Retrait à Bangui", "Vous êtes prévenu quand la commande est disponible. Le retrait à Bangui est l'option principale."],
];

export default function Comment() {
  return (
    <Layout title="Comment ça marche">
      <section className="block"><div className="wrap">
        <h2>Comment ça marche</h2>
        <div className="grid">
          {STEPS.map(([t, d], i) => (
            <div className="card" key={t}><div className="n">{i + 1}</div><h3>{t}</h3><p className="muted" style={{ margin: 0 }}>{d}</p></div>
          ))}
        </div>
        <h2 className="mt">Les frais d&apos;un devis</h2>
        <ul>
          <li>Prix d&apos;achat du produit</li>
          <li>Transport jusqu&apos;au point de regroupement, si applicable</li>
          <li>Transport international et assurance éventuelle</li>
          <li>Estimation des droits et taxes douaniers</li>
          <li>Frais locaux éventuels</li>
          <li>Frais de service KARGORA</li>
        </ul>
        <p className="notice">Nous n&apos;affichons aucune date de départ tant qu&apos;un transporteur ne l&apos;a pas confirmée, et nous ne promettons aucun délai non vérifié.</p>
        <p><Link href="/demande" className="btn">Demander un devis</Link></p>
      </div></section>
    </Layout>
  );
}
