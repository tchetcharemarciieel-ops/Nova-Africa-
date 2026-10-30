import Link from "next/link";
import Layout from "../components/Layout";

export default function CartesCadeaux() {
  return (
    <Layout title="Cartes cadeaux" description="Cartes cadeaux et crédits numériques officiels, sur demande et sur devis.">
      <section className="block"><div className="wrap">
        <h2>Cartes cadeaux</h2>
        <p>Apple, Google Play, PlayStation, Spotify et autres : indiquez la carte, le montant et la région de votre compte. Nous vérifions la compatibilité et le prix auprès de fournisseurs autorisés, puis nous vous envoyons un devis.</p>
        <ol>
          <li>Vous choisissez la carte, le montant et la région.</li>
          <li>Nous vérifions la disponibilité et le prix.</li>
          <li>Vous acceptez le devis et payez.</li>
          <li>Nous effectuons l&apos;opération autorisée et vous envoyons la confirmation.</li>
        </ol>
        <div className="notice">Une carte doit correspondre à la région de votre compte. Nous refusons toute demande dont la compatibilité ne peut pas être vérifiée.</div>
        <p><Link className="btn" href="/demande-numerique?service=carte_cadeau">Demander une carte cadeau</Link></p>
      </div></section>
    </Layout>
  );
}
