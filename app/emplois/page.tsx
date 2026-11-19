"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { depuis, readOffres, waLien, type Offre } from "@/lib/data";

export default function Emplois() {
  const [liste, setListe] = useState<Offre[] | null>(null);
  useEffect(() => { setListe(readOffres()); }, []);
  return (
    <main className="wrap">
      <h1>Offres d&apos;emploi</h1>
      <p className="lead">Emplois, stages et missions à Bangui. Postule sur WhatsApp avec ta carte.</p>
      <Link href="/emplois/nouveau" className="btn b2" style={{ width: "100%" }}>Publier une offre</Link>
      <p className="demo">Version de test : tu vois seulement les offres publiées sur ce téléphone. Aucune offre n&apos;est vérifiée pour l&apos;instant : méfie-toi de toute offre qui demande de l&apos;argent.</p>
      {liste === null ? <p className="note">Chargement…</p> : liste.length === 0 ? <p className="vide">Aucune offre pour l&apos;instant.</p>
        : liste.map(o => (
          <article key={o.id} className="pro" style={{ display: "block" }}>
            <b>{o.titre}</b><small>{o.organisation} · {o.lieu} · {o.type} · {depuis(o.creeLe)}</small>
            {o.details && <p style={{ margin: "8px 0", fontSize: 15 }}>{o.details}</p>}
            <a className="btn b1" style={{ width: "100%" }} href={waLien(o.telephone, `Bonjour, je postule à l'offre « ${o.titre} ». Voici ma carte pro : `)} target="_blank" rel="noopener noreferrer">Postuler sur WhatsApp</a>
          </article>))}
    </main>
  );
}
