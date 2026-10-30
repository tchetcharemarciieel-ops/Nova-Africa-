import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { CONTACT } from "../lib/supabase";

const NAV = [
  ["/", "Accueil"],
  ["/particuliers", "Achats internationaux"],
  ["/commercants", "Approvisionnement professionnel"],
  ["/services-numeriques", "Services numériques"],
  ["/cartes-cadeaux", "Cartes cadeaux"],
  ["/suivi", "Suivre ma commande"],
  ["/demande", "Demander un devis"],
  ["/contact", "Contact"],
];

export default function Layout({ title, description, children }) {
  const { pathname } = useRouter();
  const full = title ? `${title} · KARGORA` : "KARGORA · Achats, approvisionnement, logistique";
  return (
    <>
      <Head>
        <title>{full}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={description || "KARGORA aide les commerçants et particuliers de Bangui à rechercher et commander des produits auprès de fournisseurs locaux ou internationaux."} />
      </Head>
      <header className="site">
        <div className="wrap">
          <Link href="/" className="brand">KARGORA<small>ACHATS · APPROVISIONNEMENT · LOGISTIQUE</small></Link>
          <nav className="main" aria-label="Navigation principale">
            {NAV.map(([href, label]) => (
              <Link key={href} href={href} className={pathname === href ? "on" : ""}>{label}</Link>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site">
        <div className="wrap">
          <strong>KARGORA</strong> — Vous cherchez. Nous approvisionnons.
          <div style={{ marginTop: 8 }}>
            {CONTACT.whatsapp && <>WhatsApp : {CONTACT.whatsapp} · </>}
            {CONTACT.email && <>{CONTACT.email} · </>}
            <Link href="/conditions">Conditions et confidentialité</Link>
          </div>
          <div style={{ marginTop: 8, opacity: 0.8 }}>
            Une demande n&apos;est pas une commande : aucun achat n&apos;est lancé sans devis accepté et paiement confirmé.
          </div>
        </div>
      </footer>
    </>
  );
}
