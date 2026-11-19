"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { depuis, readBesoins, waLien, type Besoin } from "@/lib/data";

export default function Besoins() {
  const [liste, setListe] = useState<Besoin[] | null>(null);
  useEffect(() => { setListe(readBesoins()); }, []);
  return (
    <main className="wrap">
      <h1>Besoins</h1>
      <p className="lead">Quelqu&apos;un cherche un professionnel : réponds-lui sur WhatsApp.</p>
      <Link href="/besoins/nouveau" className="btn b2" style={{ width: "100%" }}>J&apos;ai besoin de…</Link>
      <p className="demo">Version de test : tu vois seulement les besoins publiés sur ce téléphone.</p>
      {liste === null ? <p className="note">Chargement…</p> : liste.length === 0 ? <p className="vide">Aucun besoin pour l&apos;instant.</p>
        : liste.map((b, i) => (
          <div key={b.id} className={`need${i % 2 ? " alt" : ""}`} style={{ alignItems: "flex-start" }}>
            <div><b>{b.titre}</b><small>{b.metier} · {b.lieu} · {depuis(b.creeLe)}</small>{b.details && <small style={{ display: "block", marginTop: 6 }}>{b.details}</small>}</div>
            <a className="go" href={waLien(b.telephone, `Bonjour, je réponds à ton besoin : ${b.titre}`)} target="_blank" rel="noopener noreferrer">Répondre</a>
          </div>))}
    </main>
  );
}
