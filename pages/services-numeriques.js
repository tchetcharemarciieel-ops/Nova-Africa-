import Link from "next/link";
import Layout from "../components/Layout";
import { SERVICES, OTHER_SERVICES } from "../lib/services";

export default function ServicesNumeriques() {
  return (
    <Layout title="Services numériques" description="Abonnements, renouvellements et crédits numériques sur demande, avec devis.">
      <section className="block"><div className="wrap">
        <h2>Services numériques</h2>
        <p>Demandez un abonnement, un renouvellement ou un crédit numérique. Chaque demande est étudiée : nous vérifions la disponibilité et le prix, puis nous vous envoyons un devis. Vous payez seulement après l&apos;avoir accepté.</p>
        <div className="grid">
          {SERVICES.map((s) => (
            <div className="card" key={s.id}>
              <h3>{s.name}</h3>
              <p className="muted">{s.text}</p>
              <Link className="btn sm blue" href={`/demande-numerique?service=${s.id}`}>Demander un devis</Link>
            </div>
          ))}
        </div>
        <h3 className="mt">Autres services</h3>
        <ul>{OTHER_SERVICES.map((s) => <li key={s.id}><Link href={`/demande-numerique?service=${s.id}`}>{s.name}</Link></li>)}</ul>
        <div className="notice">
          <strong>Nos règles.</strong> Nous travaillons avec des fournisseurs autorisés et respectons les conditions de chaque plateforme, y compris les restrictions géographiques.
          Nous ne vendons ni comptes partagés ni codes d&apos;origine douteuse.
          <strong> Nous ne vous demanderons jamais votre mot de passe.</strong>
        </div>
        <div className="notice mt">Aucun stock de codes n&apos;est affiché : chaque opération est vérifiée et confirmée au cas par cas.</div>
      </div></section>
    </Layout>
  );
}
