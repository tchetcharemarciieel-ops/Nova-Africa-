"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ProLigne from "@/components/ProLigne";
import { LIEUX, METIERS, readCards, type Card } from "@/lib/data";

function Contenu() {
  const router = useRouter();
  const sp = useSearchParams();
  const m = sp.get("m") || "";
  const l = sp.get("l") || "";
  const [cartes, setCartes] = useState<Card[] | null>(null);
  useEffect(() => { setCartes(readCards()); }, []);
  const liste = (cartes ?? []).filter(c => (!m || c.metier === m) && (!l || c.lieu === l));

  function maj(cle: "m" | "l", v: string) {
    const q = new URLSearchParams(sp.toString());
    if (v) q.set(cle, v); else q.delete(cle);
    router.replace(`/chercher?${q.toString()}`);
  }

  return (
    <main className="wrap">
      <h1>Chercher</h1>
      <div className="search">
        <div><label htmlFor="m">Métier</label><select id="m" value={m} onChange={e => maj("m", e.target.value)}><option value="">Tous les métiers</option>{METIERS.map(x => <option key={x}>{x}</option>)}</select></div>
        <div><label htmlFor="l">Quartier</label><select id="l" value={l} onChange={e => maj("l", e.target.value)}><option value="">Tous les quartiers</option>{LIEUX.map(x => <option key={x}>{x}</option>)}</select></div>
      </div>
      <p className="demo">Version de test : tu vois seulement les cartes créées sur ce téléphone.</p>
      <div aria-live="polite">
        {cartes === null ? <p className="note">Chargement…</p>
          : liste.length === 0 ? <p className="vide">Aucun professionnel pour ces critères. <Link href="/besoins/nouveau">Publie un besoin</Link> ou <Link href="/creer">crée ta carte</Link>.</p>
          : liste.map(c => <ProLigne key={c.slug} c={c} />)}
      </div>
    </main>
  );
}

export default function Chercher() { return <Suspense fallback={<main className="wrap"><p className="note">Chargement…</p></main>}><Contenu /></Suspense>; }
