"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icone from "./Icone";
import { KINDS, ORDRE, dateDuJour } from "@/lib/constants";
import { useEffect, useState } from "react";

export function Entete() {
  const [date, setDate] = useState("");
  useEffect(() => setDate(dateDuJour()), []);
  return (
    <header className="entete"><div className="entete-in">
      <div><Link href="/" className="titre">Bangui Aujourd&apos;hui</Link><span className="date">{date || " "}</span></div>
      <Link href="/signaler" className="btn noir"><Icone nom="plus" taille={18} /> Signaler</Link>
    </div></header>
  );
}

export function Bas() {
  const path = usePathname();
  const items: { href: string; nom: string; icone: "accueil" | "carburant" | "prix" | "coupure" | "alerte"; c?: string }[] = [
    { href: "/", nom: "Aujourd'hui", icone: "accueil" },
    ...ORDRE.map(k => ({ href: `/s/${k}`, nom: KINDS[k].court, icone: k, c: KINDS[k].couleur })),
  ];
  return (
    <nav className="bas" aria-label="Navigation principale">
      {items.map(i => { const on = i.href === "/" ? path === "/" : path.startsWith(i.href); return (
        <Link key={i.href} href={i.href} className={on ? "on" : ""} aria-current={on ? "page" : undefined} style={i.c ? ({ ["--c" as string]: i.c }) : undefined}>
          <span><Icone nom={i.icone} />{i.nom}</span>
        </Link>); })}
    </nav>
  );
}
