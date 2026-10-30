import Link from "next/link";
import Layout from "../components/Layout";
import Icon from "../components/Icons";
import HeroArt from "../components/HeroArt";
import Reveal from "../components/Reveal";
import { SIGNUP_OPEN } from "../lib/flags";

const HOW = [
  ["Votre demande", "Un lien, une photo ou une description. C'est gratuit."],
  ["Vérification", "Nous vérifions l'achat, le transport et la livraison."],
  ["Devis en FCFA", "Détaillé, que vous acceptez ou refusez."],
  ["Paiement vérifié", "Confirmé par nos soins, avec reçu."],
  ["Achat et retrait", "Nous achetons, expédions, vous retirez à Bangui."],
];
const FAQ = [
  ["Une demande est-elle une commande ?", "Non. Une demande est une étude gratuite. Aucun achat n'est lancé sans devis accepté et paiement confirmé."],
  ["Comment sont calculés les frais de douane ?", "Ils sont estimés produit par produit avec un professionnel habilité, jamais avec un pourcentage universel. Le devis indique s'ils sont estimés ou confirmés."],
  ["Quels moyens de paiement ?", "Orange Money marchand, virement bancaire et paiement au comptoir avec reçu, selon leur validation. Les instructions n'apparaissent qu'après acceptation du devis."],
  ["Demandez-vous mon mot de passe pour un abonnement ?", "Jamais. Ne partagez votre mot de passe ni vos codes de sécurité avec personne, y compris avec nous."],
  ["Où retirer ma commande ?", "À Bangui. Le point de retrait officiel sera communiqué dès sa confirmation."],
  ["Les délais sont-ils garantis ?", "Non : un délai n'est annoncé que lorsqu'un transporteur l'a confirmé. Le devis indique un délai estimatif."],
];
const Arrow = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;

export default function Home() {
  return (
    <Layout>
      <div className="hero">
        <div className="wrap">
          <div>
            <span className="eyebrow" style={{ color: "#ffb27a" }}>Bangui · République centrafricaine</span>
            <h1>Tout ce dont vous avez besoin, <em>au même endroit.</em></h1>
            <p className="lead">Achats internationaux, approvisionnement professionnel et services numériques. Décrivez ce que vous cherchez : nous le trouvons, vous recevez un devis clair en FCFA.</p>
            <div className="actions">
              <Link href="/demande" className="btn">Faire une demande <Arrow /></Link>
              <Link href="/services" className="btn ghost">Découvrir nos services</Link>
            </div>
            <div className="chip-row">
              <span className="chip"><Icon name="shield" />Paiements vérifiés</span>
              <span className="chip"><Icon name="doc" />Devis détaillé</span>
              <span className="chip"><Icon name="truck" />Suivi de commande</span>
            </div>
          </div>
          <HeroArt />
        </div>
      </div>

      <section className="block" style={{ paddingTop: 20 }}><div className="wrap">
        <div className="strip">
          {[["doc", "Devis détaillé", "chaque frais expliqué"], ["shield", "Paiement vérifié", "reçu pour chaque paiement"], ["truck", "Suivi complet", "de la demande au retrait"], ["store", "Retrait à Bangui", "avec numéro de retrait"]].map(([i, t, s]) => (
            <div key={t}><span className="icon" style={{ margin: 0 }}><Icon name={i} /></span><div><b>{t}</b><small>{s}</small></div></div>
          ))}
        </div>
      </div></section>

      <section className="block"><div className="wrap">
        <Reveal><div className="head"><span className="eyebrow">Nos activités</span><h2>Trois façons de vous servir</h2><p className="muted">Un seul endroit pour acheter à l&apos;étranger, vous approvisionner et accéder à vos services numériques.</p></div></Reveal>
        <div className="bento">
          <Reveal><Link href="/particuliers" className="b dark">
            <span className="bi"><Icon name="globe" /></span><h3>Achats internationaux</h3>
            <p>Un produit trouvé en ligne ou chez un fournisseur ? Collez le lien : nous étudions l&apos;achat et le transport jusqu&apos;à Bangui.</p>
            <span className="go">Commander un produit <Arrow /></span>
          </Link></Reveal>
          <Reveal delay={90}><Link href="/commercants" className="b light">
            <span className="bi"><Icon name="store" /></span><h3>Approvisionnement pro</h3>
            <p>Marchandises en quantité pour commerçants, boutiques et entreprises.</p>
            <span className="go">Espace professionnel <Arrow /></span>
          </Link></Reveal>
          <Reveal delay={180}><Link href="/services-numeriques" className="b warm">
            <span className="bi"><Icon name="play" /></span><h3>Services numériques</h3>
            <p>Abonnements, renouvellements et cartes cadeaux, sur devis.</p>
            <span className="go">Voir les services <Arrow /></span>
          </Link></Reveal>
        </div>
        <Reveal><div className="chips">
          {["Netflix", "Spotify", "Canva", "PlayStation", "Apple", "Google Play"].map((n) => <Link key={n} href="/services-numeriques">{n}</Link>)}
        </div></Reveal>
      </div></section>

      <section className="block alt"><div className="wrap">
        <Reveal><div className="head" style={{ textAlign: "center", margin: "0 auto 34px" }}><span className="eyebrow">Fonctionnement</span><h2>Simple, clair, vérifié</h2></div></Reveal>
        <div className="stepper">
          {HOW.map(([t, d], i) => <Reveal key={t} delay={i * 80}><div className="s"><div className="n">{i + 1}</div><div><h3>{t}</h3><p>{d}</p></div></div></Reveal>)}
        </div>
        <Reveal><p className="notice mt">Transparence : KARGORA n&apos;affiche ni faux stock, ni faux délai, ni prix définitif non vérifié. Chaque prix est établi dans un devis, après vérification.</p></Reveal>
      </div></section>

      <section className="block"><div className="wrap">
        <div className="split">
          <Reveal><div>
            <span className="eyebrow">Commerçants et entreprises</span>
            <h2>Approvisionnez votre boutique en quantité</h2>
            <p className="muted">Envoyez votre liste de produits, indiquez les quantités et la fréquence : nous cherchons les fournisseurs et vous remettons un devis professionnel.</p>
            <ul className="checks"><li>Plusieurs produits dans une même demande</li><li>Devis détaillé : produit, transport, douane estimée, frais</li><li>Suivi de chaque commande, du fournisseur à Bangui</li></ul>
            <Link href="/commercants" className="btn blue">Demander un devis pro <Arrow /></Link>
          </div></Reveal>
          <Reveal delay={120}><div className="card" style={{ padding: 26 }}>
            <h3>Exemple de demande groupée</h3>
            <p className="muted" style={{ marginTop: 0 }}>Illustration : le contenu réel est celui que vous envoyez.</p>
            {["Accessoires téléphoniques · quantité à préciser", "Emballages et présentoirs · quantité à préciser", "Vêtements et chaussures · quantité à préciser"].map((l) => <div key={l} style={{ display: "flex", gap: 10, padding: "11px 0", borderTop: "1px solid var(--line)", alignItems: "center" }}><span className="icon" style={{ width: 34, height: 34, margin: 0, borderRadius: 10 }}><Icon name="box" /></span>{l}</div>)}
            <div className="notice mt">Pas de prix grossiste affiché : chaque prix est établi après vérification auprès du fournisseur.</div>
          </div></Reveal>
        </div>
      </div></section>

      <section className="block"><div className="wrap">
        <Reveal><div className="band">
          <div><span className="eyebrow" style={{ color: "#ffb27a" }}>Gratuit · chaque samedi</span><h2>Le tirage au sort KARGORA</h2><p>Des tirages gratuits chaque samedi pour tenter de gagner une importation ou un colis offert. Aucun achat nécessaire. Ouverture prochaine : lots et règlement en cours de validation.</p></div>
          <div><Link href="/loterie" className="btn">En savoir plus</Link></div>
        </div></Reveal>
      </div></section>

      <section className="block alt"><div className="wrap" style={{ maxWidth: 800 }}>
        <Reveal><div className="head"><span className="eyebrow">Questions fréquentes</span><h2>Vos questions</h2></div></Reveal>
        {FAQ.map(([q, a]) => <details className="faq" key={q}><summary>{q}</summary><p>{a}</p></details>)}
      </div></section>

      <section className="block"><div className="wrap">
        <Reveal><div className="ctaband">
          <h2>Prêt à lancer votre première demande ?</h2>
          <p>Décrivez votre besoin en 2 minutes. Vous recevez un devis clair, sans engagement.</p>
          <Link href="/demande" className="btn">Demander un devis <Arrow /></Link>
          {!SIGNUP_OPEN && <p style={{ marginTop: 14, marginBottom: 0, fontSize: ".9rem" }}>Les comptes clients ouvrent très prochainement.</p>}
        </div></Reveal>
      </div></section>
    </Layout>
  );
}
