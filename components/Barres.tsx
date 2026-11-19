"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icone from "./Icone";
import { api } from "@/lib/api";
import { secretExistant } from "@/lib/session";

export function BarreHaut() {
  const [nonLus, setNonLus] = useState(0);
  const path = usePathname();
  useEffect(() => {
    let vivant = true;
    async function charger() {
      const s = secretExistant();
      if (!s) return;
      try { const n = await api.unread(s); if (vivant) setNonLus(n); } catch { /* silencieux */ }
    }
    charger();
    const t = setInterval(charger, 30000);
    return () => { vivant = false; clearInterval(t); };
  }, [path]);
  return (
    <header className="barre">
      <div className="barre-in">
        <Link href="/" className="marque" aria-label="Réseau pro, accueil"><b aria-hidden="true">R</b></Link>
        <Link href="/chercher" className="recherche"><Icone nom="recherche" taille={18} /> Chercher un métier, un quartier</Link>
        <Link href="/messages" className="icone" aria-label={nonLus ? `Messages, ${nonLus} non lus` : "Messages"}>
          <Icone nom="message" />{nonLus > 0 && <span className="badge" aria-hidden="true">{nonLus > 9 ? "9+" : nonLus}</span>}
        </Link>
      </div>
    </header>
  );
}

const ITEMS = [
  { href: "/", nom: "Accueil", icone: "accueil" as const },
  { href: "/chercher", nom: "Réseau", icone: "reseau" as const },
  { href: "/publier", nom: "Publier", icone: "publier" as const },
  { href: "/messages", nom: "Messages", icone: "message" as const },
  { href: "/creer", nom: "Moi", icone: "moi" as const },
];

export function BarreBas() {
  const path = usePathname();
  const actif = (h: string) => (h === "/" ? path === "/" : h === "/publier" ? ["/publier", "/besoins", "/emplois"].some(p => path.startsWith(p)) : h === "/creer" ? path.startsWith("/creer") || path.startsWith("/p/") : path.startsWith(h));
  return (
    <nav className="bas" aria-label="Navigation principale">
      {ITEMS.map(i => <Link key={i.href} href={i.href} className={actif(i.href) ? "on" : ""} aria-current={actif(i.href) ? "page" : undefined}><span><Icone nom={i.icone} /><span style={{ display: "block" }}>{i.nom}</span></span></Link>)}
    </nav>
  );
}
