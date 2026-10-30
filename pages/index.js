import Link from "next/link";
import Layout from "../components/Layout";

const STEPS = [
  ["Votre demande", "Vous décrivez le produit ou envoyez un lien, avec la quantité souhaitée."],
  ["Vérification", "Nous vérifions les possibilités d'achat et de transport."],
  ["Devis en FCFA", "Vous recevez un devis détaillé. Vous l'acceptez ou le refusez."],
  ["Paiement", "Après acceptation, vous payez. Nous confirmons chaque paiement nous-mêmes."],
  ["Achat et transport", "Nous achetons, regroupons et expédions vers Bangui."],
  ["Retrait à Bangui", "Vous suivez l'avancement puis retirez votre commande."],
];

export default function Home() {
  return (
    <Layout>
      <div className="hero">
        <div className="wrap">
          <div className="tag">BANGUI · RÉPUBLIQUE CENTRAFRICAINE</div>
          <h1>Vous cherchez.<br />Nous approvisionnons.</h1>
          <p>
            KARGORA recherche et commande pour vous des produits auprès de fournisseurs locaux ou
            internationaux : en petite quantité pour un particulier, en gros pour un commerçant.
          </p>
          <Link href="/demande" className="btn">Demander un devis</Link>{" "}
          <Link href="/suivi" className="btn alt">Suivre ma commande</Link>
        </div>
      </div>

      <section className="block">
        <div className="wrap">
          <h2>Comment ça marche</h2>
          <div className="grid">
            {STEPS.map(([t, d], i) => (
              <div className="card" key={t}><div className="n">{i + 1}</div><h3>{t}</h3><p className="muted" style={{ margin: 0 }}>{d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="block alt">
        <div className="wrap">
          <h2>Pour qui ?</h2>
          <div className="grid">
            <div className="card"><h3>Commerçants</h3><p>Accessoires, vêtements, emballages, fournitures de boutique, marchandises en quantité.</p><Link href="/commercants">Voir l&apos;offre commerçants →</Link></div>
            <div className="card"><h3>Entreprises</h3><p>Mobilier, matériel informatique, fournitures et équipements professionnels.</p><Link href="/commercants">Demande professionnelle →</Link></div>
            <div className="card"><h3>Particuliers</h3><p>Vous avez trouvé un produit en ligne ? Envoyez-nous le lien.</p><Link href="/particuliers">Commander à partir d&apos;un lien →</Link></div>
          </div>
          <p className="notice mt">
            Transparence : KARGORA ne tient pas de stock affiché. Chaque prix et chaque délai est
            établi au cas par cas dans un devis, après vérification.
          </p>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <h2>Des frais expliqués</h2>
          <p>Chaque devis détaille : le prix du produit, le transport, l&apos;estimation des droits et taxes douaniers, les frais locaux éventuels et les frais de service KARGORA.</p>
          <Link href="/demande" className="btn blue">Demander un devis</Link>
        </div>
      </section>
    </Layout>
  );
}
