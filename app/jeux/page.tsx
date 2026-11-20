"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icone from "@/components/Icone";
import { JEUX, resume, scoreDuJour, type Jeu } from "@/lib/jeux";

export default function Jeux() {
  const [pret, setPret] = useState(false);
  const [scores, setScores] = useState<Partial<Record<Jeu, number | null>>>({});
  const [r, setR] = useState({ total: 0, jours: 0, serie: 0 });
  useEffect(() => { setScores(Object.fromEntries(JEUX.map(j => [j.id, scoreDuJour(j.id)]))); setR(resume()); setPret(true); }, []);
  return (
    <main className="page">
      <section className="hero-jeux">
        <span className="sur" style={{ background: "rgba(255,255,255,.12)", color: "#C7D2FE" }}>Entraînement quotidien</span>
        <h1>Jeux de réflexion pro</h1>
        <p>Trois petits défis par jour pour t&apos;entraîner. Ton score s&apos;affiche sur ton profil.</p>
        {pret && <div className="hero-chiffres"><div><b>{r.total}</b><span>points</span></div><div><b>{r.serie}</b><span>jours d&apos;affilée</span></div><div><b>{r.jours}</b><span>jours joués</span></div></div>}
      </section>
      <section className="carte menu">
        {JEUX.map(j => {
          const s = scores[j.id];
          return (
            <Link key={j.id} href={j.href} className="menu-ligne">
              <span className="menu-ico" style={{ background: "#EEF2FF", color: "#4F46E5" }}><Icone nom="jeux" taille={22} /></span>
              <span className="menu-txt"><b>{j.nom}</b><small>{pret && typeof s === "number" ? `Fait aujourd'hui : ${s} / 100` : j.texte}</small></span>
              <span className="menu-chev"><Icone nom="chevron" taille={20} /></span>
            </Link>
          );
        })}
      </section>
      <p className="mute petit" style={{ padding: "0 4px" }}>Un seul score par jeu et par jour. Les jeux ne demandent aucun argent.</p>
    </main>
  );
}
