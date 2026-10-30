import Link from "next/link";
import Layout from "../components/Layout";
import Icon from "../components/Icons";

const CATS = [
  { icon: "globe", title: "Commerce et achats", items: [
    ["Achat d'un produit à l'international", "Sur demande", "/demande", "Faire une demande"],
    ["Approvisionnement professionnel", "Sur demande", "/commercants", "Demander un devis pro"],
    ["Recherche de fournisseurs", "Sur demande", "/commercants", "En savoir plus"],
    ["Livraison à domicile", "Bientôt disponible", null, ""],
  ] },
  { icon: "play", title: "Services numériques", items: [
    ["Abonnements et renouvellements (Netflix, Spotify, Canva…)", "Sur demande", "/services-numeriques", "Voir les services"],
    ["Cartes cadeaux (Apple, Google Play, PlayStation…)", "Sur demande", "/cartes-cadeaux", "Demander une carte"],
    ["Logiciels, licences, domaines et hébergement", "Sur demande", "/demande-numerique?service=logiciel", "Demander un devis"],
    ["Catalogue de codes en vente directe", "Bientôt disponible", null, ""],
  ] },
  { icon: "zap", title: "Services pratiques", items: [
    ["Paiement de services en ligne autorisés", "Sur demande", "/demande-numerique?service=paiement", "Demander un devis"],
    ["Commande personnalisée", "Sur demande", "/demande", "Décrire mon besoin"],
    ["Suivi de commande en ligne", "Disponible", "/suivi", "Suivre ma commande"],
  ] },
];
const PILL = { "Disponible": "ok", "Sur demande": "req", "Bientôt disponible": "soon" };

export default function Services() {
  return (
    <Layout title="Nos services" description="Commerce et achats, services numériques et services pratiques KARGORA.">
      <section className="block"><div className="wrap">
        <div className="head"><span className="eyebrow">Nos services</span><h2>Ce que KARGORA peut faire pour vous</h2><p className="muted">Chaque service indique clairement son état : disponible, sur demande ou bientôt disponible.</p></div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}>
          {CATS.map((c) => (
            <div className="card" key={c.title}>
              <div className="icon"><Icon name={c.icon} /></div><h3>{c.title}</h3>
              {c.items.map(([name, state, href, cta]) => (
                <div key={name} style={{ padding: "12px 0", borderTop: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><b style={{ fontSize: ".95rem" }}>{name}</b><span className={`pill ${PILL[state]}`}>{state}</span></div>
                  {href && <Link href={href} style={{ fontSize: ".9rem" }}>{cta} →</Link>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div></section>
    </Layout>
  );
}
