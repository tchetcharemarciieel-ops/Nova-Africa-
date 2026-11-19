"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LIEUX, METIERS, readCards, type Card } from "@/lib/cards";

export default function Chercher() {
  const [cartes, setCartes] = useState<Card[] | null>(null);
  const [metier, setMetier] = useState("");
  const [lieu, setLieu] = useState("");
  useEffect(() => { setCartes(readCards()); }, []);

  const liste = (cartes ?? []).filter(c => (!metier || c.metier === metier) && (!lieu || c.lieu === lieu));

  return (
    <main className="wrap">
      <h1>Chercher un professionnel</h1>
      <p className="demo">Version de test : tu ne vois que les cartes créées sur ce téléphone.</p>
      <label htmlFor="metier">Métier</label>
      <select id="metier" value={metier} onChange={e => setMetier(e.target.value)}>
        <option value="">Tous les métiers</option>
        {METIERS.map(m => <option key={m}>{m}</option>)}
      </select>
      <label htmlFor="lieu">Quartier</label>
      <select id="lieu" value={lieu} onChange={e => setLieu(e.target.value)}>
        <option value="">Tous les quartiers</option>
        {LIEUX.map(l => <option key={l}>{l}</option>)}
      </select>
      <div className="list" aria-live="polite">
        {cartes === null ? <p className="note">Chargement…</p> : liste.length === 0 ? (
          <p className="card">Aucun professionnel pour l&apos;instant. <Link href="/creer">Crée la première carte.</Link></p>
        ) : liste.map(c => (
          <Link key={c.slug} href={`/p/${c.slug}`} className="card" style={{ textDecoration: "none", color: "inherit" }}>
            <span className="badge">{c.metier}</span>
            <p className="pro-nom" style={{ fontSize: 20 }}>{c.nom}</p>
            <p className="pro-meta" style={{ margin: 0 }}>{c.lieu}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
