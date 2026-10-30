import Link from "next/link";
import Layout from "../components/Layout";

export default function Particuliers() {
  return (
    <Layout title="Pour les particuliers" description="Commandez un produit précis à partir d'un lien ou d'une description.">
      <section className="block"><div className="wrap">
        <h2>Pour les particuliers</h2>
        <p>Vous avez repéré un produit sur un site étranger ou chez un fournisseur ? Envoyez-nous le lien ou une description. Nous vérifions s&apos;il peut être acheté et transporté jusqu&apos;à Bangui, puis nous vous envoyons un devis.</p>
        <ol>
          <li>Vous remplissez le formulaire (lien du produit, quantité).</li>
          <li>Vous recevez un numéro de demande.</li>
          <li>Vous recevez un devis : vous êtes libre de l&apos;accepter ou de le refuser.</li>
          <li>Rien n&apos;est acheté avant votre acceptation et le paiement confirmé.</li>
        </ol>
        <p><Link href="/demande?profil=particulier" className="btn">Demander un produit</Link></p>
      </div></section>
    </Layout>
  );
}
