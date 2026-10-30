import Link from "next/link";
import Layout from "../components/Layout";

export default function APropos() {
  return (
    <Layout title="À propos">
      <section className="block"><div className="wrap">
        <h2>À propos de KARGORA</h2>
        <p>KARGORA aide les commerçants, les petites entreprises et les particuliers de Bangui à rechercher et commander des produits auprès de fournisseurs locaux ou internationaux.</p>
        <p>Nous démarrons avec une première version volontairement simple : recevoir de vraies demandes, envoyer des devis honnêtes, livrer des commandes avec une marge juste. Nous n&apos;affichons ni faux stock, ni faux délai, ni prix définitif non vérifié.</p>
        <p className="muted">Les informations légales de l&apos;entreprise (raison sociale, immatriculation, adresse) seront publiées ici dès leur validation.</p>
        <Link href="/contact" className="btn blue">Nous contacter</Link>
      </div></section>
    </Layout>
  );
}
