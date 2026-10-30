import Link from "next/link";
import Layout from "../components/Layout";
import Icon from "../components/Icons";

const HOW = [
  ["Votre demande", "Décrivez un produit, envoyez un lien ou choisissez un service numérique."],
  ["Vérification", "Nous vérifions les possibilités d'achat, de transport et de livraison."],
  ["Devis en FCFA", "Vous recevez un devis détaillé, que vous acceptez ou refusez dans votre espace."],
  ["Paiement vérifié", "Après acceptation, vous payez. Nous confirmons chaque paiement nous-mêmes."],
  ["Achat et livraison", "Nous achetons, transportons, puis vous retirez votre commande à Bangui."],
];
const FAQ = [
  ["Une demande est-elle une commande ?", "Non. Une demande est une étude gratuite. Aucun achat n'est lancé sans devis accepté et paiement confirmé."],
  ["Comment sont calculés les frais de douane ?", "Ils sont estimés produit par produit avec un professionnel habilité, jamais avec un pourcentage universel. Le devis indique s'ils sont estimés ou confirmés."],
  ["Quels moyens de paiement ?", "Orange Money marchand, virement bancaire et paiement au comptoir avec reçu, selon leur validation. Les instructions n'apparaissent qu'après acceptation du devis."],
  ["Demandez-vous mon mot de passe pour un abonnement ?", "Jamais. Ne partagez votre mot de passe ni vos codes de sécurité avec personne, y compris avec nous."],
  ["Où retirer ma commande ?", "À Bangui. Le point de retrait officiel sera communiqué dans votre espace dès sa confirmation."],
  ["Les délais sont-ils garantis ?", "Non : un délai n'est annoncé que lorsqu'un transporteur l'a confirmé. Le devis indique un délai estimatif."],
];

export default function Home() {
  return (
    <Layout>
      <div className="hero">
        <div className="wrap">
          <div>
            <span className="eyebrow" style={{ color: "#ffb27a" }}>Bangui · République centrafricaine</span>
            <h1>Tout ce dont vous avez besoin, au même endroit.</h1>
            <p>KARGORA vous accompagne dans vos achats, votre approvisionnement et vos services numériques. Demandez un produit, trouvez un fournisseur ou accédez à vos services préférés en toute simplicité.</p>
            <div className="actions">
              <Link href="/demande" className="btn">Faire une demande</Link>
              <Link href="/services" className="btn ghost">Découvrir nos services</Link>
            </div>
          </div>
          <div className="hero-card">
            <h3>Comment ça se passe</h3>
            <div className="route"><b /><i /><span>Fournisseur</span><i /><span>Transport</span><i /><b className="d" /><span>Bangui</span></div>
            <p style={{ margin: 0, fontSize: ".95rem" }}>Suivez chaque étape dans votre espace : devis, paiement, achat, transport, arrivée et retrait.</p>
            <div className="actions" style={{ marginTop: 14 }}>
              <Link href="/inscription" className="btn sm">Créer un compte</Link>
              <Link href="/suivi" className="btn sm ghost">Suivre une commande</Link>
            </div>
          </div>
        </div>
      </div>

      <section className="block"><div className="wrap">
        <div className="head"><span className="eyebrow">Nos activités</span><h2>Trois façons de vous servir</h2></div>
        <div className="grid">
          <div className="card"><div className="icon"><Icon name="globe" /></div><h3>Achats internationaux</h3><p className="muted">Un produit trouvé en ligne ou chez un fournisseur ? Nous étudions l&apos;achat et le transport jusqu&apos;à Bangui.</p><Link href="/particuliers">Commander un produit →</Link></div>
          <div className="card"><div className="icon"><Icon name="store" /></div><h3>Approvisionnement professionnel</h3><p className="muted">Marchandises en quantité pour commerçants, boutiques et entreprises, avec devis personnalisé.</p><Link href="/commercants">Espace professionnel →</Link></div>
          <div className="card"><div className="icon"><Icon name="play" /></div><h3>Services numériques</h3><p className="muted">Netflix, Spotify, Canva, PlayStation, Apple, Google Play : abonnements et crédits, sur devis.</p><Link href="/services-numeriques">Voir les services →</Link></div>
        </div>
      </div></section>

      <section className="block alt"><div className="wrap">
        <div className="head"><span className="eyebrow">Fonctionnement</span><h2>Simple, clair, vérifié</h2></div>
        <div className="grid five">{HOW.map(([t, d], i) => <div className="card flat" key={t}><div className="n">{i + 1}</div><h3>{t}</h3><p className="muted" style={{ margin: 0 }}>{d}</p></div>)}</div>
        <p className="notice mt">Transparence : KARGORA n&apos;affiche ni faux stock, ni faux délai, ni prix définitif non vérifié. Chaque prix est établi dans un devis, après vérification.</p>
      </div></section>

      <section className="block"><div className="wrap">
        <div className="band">
          <div><span className="eyebrow" style={{ color: "#ffb27a" }}>Gratuit · chaque samedi</span><h2>Le tirage au sort KARGORA</h2><p>Créez votre compte et participez gratuitement à nos tirages hebdomadaires pour tenter de gagner une importation ou un colis offert. Aucun achat n&apos;est nécessaire.</p></div>
          <div><Link href="/loterie" className="btn">Voir le tirage</Link></div>
        </div>
      </div></section>

      <section className="block alt"><div className="wrap">
        <div className="grid">
          <div className="card"><div className="icon"><Icon name="shield" /></div><h3>Paiements vérifiés</h3><p className="muted" style={{ margin: 0 }}>Aucun paiement n&apos;est confirmé sans vérification. Un reçu est remis pour chaque paiement.</p></div>
          <div className="card"><div className="icon"><Icon name="doc" /></div><h3>Frais expliqués</h3><p className="muted" style={{ margin: 0 }}>Produit, transport, douane estimée, frais locaux et frais de service : tout est détaillé dans le devis.</p></div>
          <div className="card"><div className="icon"><Icon name="truck" /></div><h3>Suivi de bout en bout</h3><p className="muted" style={{ margin: 0 }}>Une chronologie claire de votre commande, de la demande jusqu&apos;au retrait.</p></div>
        </div>
      </div></section>

      <section className="block"><div className="wrap" style={{ maxWidth: 780 }}>
        <div className="head"><span className="eyebrow">Questions fréquentes</span><h2>Vos questions</h2></div>
        {FAQ.map(([q, a]) => <details className="faq" key={q}><summary>{q}</summary><p>{a}</p></details>)}
        <p className="mt"><Link href="/contact" className="btn blue">Une autre question ? Écrivez-nous</Link></p>
      </div></section>
    </Layout>
  );
}
