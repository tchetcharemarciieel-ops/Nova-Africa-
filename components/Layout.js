import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { CONTACT } from "../lib/supabase";
import { useUser } from "../lib/auth";
import Logo from "./Logo";

const NAV = [
  ["/particuliers", "Achats"],
  ["/commercants", "Professionnels"],
  ["/services-numeriques", "Numérique"],
  ["/cartes-cadeaux", "Cartes cadeaux"],
  ["/loterie", "Tirage"],
  ["/suivi", "Suivi"],
  ["/contact", "Contact"],
];

export default function Layout({ title, description, children }) {
  const { pathname } = useRouter();
  const [open, setOpen] = useState(false);
  const user = useUser();
  const full = title ? `${title} · KARGORA` : "KARGORA · Vos besoins, notre priorité";
  return (
    <>
      <Head>
        <title>{full}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={description || "KARGORA : achats internationaux, approvisionnement et services numériques à Bangui. Demandez un devis en ligne."} />
        <meta name="theme-color" content="#0b2a6f" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <header className="site">
        <div className="wrap">
          <Link href="/" className="brand"><Logo /></Link>
          <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "✕" : "☰"}</button>
          <nav className={`main${open ? " open" : ""}`} aria-label="Navigation principale" onClick={() => setOpen(false)}>
            {NAV.map(([href, label]) => <Link key={href} href={href} className={pathname === href ? "on" : ""}>{label}</Link>)}
            {user ? <Link href="/compte" className="btn sm blue">Mon espace</Link> : <>
              <Link href="/connexion">Connexion</Link>
              <Link href="/inscription" className="btn sm blue">Créer un compte</Link>
            </>}
            <Link href="/demande" className="btn sm">Demander un devis</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site">
        <div className="wrap">
          <div className="cols">
            <div>
              <div className="brand" style={{ color: "#fff" }}><Logo /></div>
              <p>Vos besoins, notre priorité.<br />Achats, approvisionnement, commerce international et services numériques. Bangui, République centrafricaine.</p>
              {CONTACT.whatsapp && <div>WhatsApp : {CONTACT.whatsapp}</div>}
              {CONTACT.email && <div>{CONTACT.email}</div>}
              {CONTACT.address && <div>{CONTACT.address}</div>}
            </div>
            <div><h4>Services</h4><ul>
              <li><Link href="/particuliers">Achats internationaux</Link></li>
              <li><Link href="/commercants">Approvisionnement professionnel</Link></li>
              <li><Link href="/services-numeriques">Services numériques</Link></li>
              <li><Link href="/cartes-cadeaux">Cartes cadeaux</Link></li>
            </ul></div>
            <div><h4>KARGORA</h4><ul>
              <li><Link href="/comment-ca-marche">Comment ça marche</Link></li>
              <li><Link href="/loterie">Tirage au sort</Link></li>
              <li><Link href="/a-propos">À propos</Link></li>
              <li><Link href="/conditions">Conditions et confidentialité</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul></div>
          </div>
          <p style={{ opacity: 0.75, marginTop: 20 }}>Une demande n&apos;est pas une commande : aucun achat n&apos;est lancé sans devis accepté et paiement confirmé.</p>
        </div>
      </footer>
    </>
  );
}
