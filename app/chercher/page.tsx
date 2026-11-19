"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ProLigne, Chargement, Erreur } from "@/components/Blocs";
import { LIEUX, METIERS } from "@/lib/constants";
import { api, messageErreur, type Resume } from "@/lib/api";

function Contenu() {
  const router = useRouter();
  const sp = useSearchParams();
  const m = sp.get("m") || "";
  const l = sp.get("l") || "";
  const [liste, setListe] = useState<Resume[] | null>(null);
  const [erreur, setErreur] = useState("");
  useEffect(() => {
    let vivant = true;
    setListe(null); setErreur("");
    api.search(m, l, 50).then(r => { if (vivant) setListe(r); }).catch(e => { if (vivant) { setListe([]); setErreur(messageErreur(e)); } });
    return () => { vivant = false; };
  }, [m, l]);
  function maj(cle: "m" | "l", v: string) {
    const q = new URLSearchParams(sp.toString());
    if (v) q.set(cle, v); else q.delete(cle);
    router.replace(`/chercher?${q.toString()}`);
  }
  return (
    <main className="page">
      <section className="carte"><div className="in">
        <h1>Réseau</h1>
        <label htmlFor="m" style={{ marginTop: 4 }}>Métier</label>
        <select id="m" value={m} onChange={e => maj("m", e.target.value)}><option value="">Tous les métiers</option>{METIERS.map(x => <option key={x}>{x}</option>)}</select>
        <label htmlFor="l">Quartier</label>
        <select id="l" value={l} onChange={e => maj("l", e.target.value)}><option value="">Tous les quartiers</option>{LIEUX.map(x => <option key={x}>{x}</option>)}</select>
      </div></section>
      {erreur && <Erreur texte={erreur} />}
      <section className="carte" aria-live="polite">
        {liste === null ? <Chargement /> : liste.length === 0 && !erreur ? <p className="in mute">Aucun professionnel pour ces critères. <Link href="/besoins/nouveau">Publie un besoin</Link> ou <Link href="/creer">crée ta carte</Link>.</p>
          : liste.map(p => <ProLigne key={p.slug} p={p} />)}
      </section>
    </main>
  );
}
export default function Chercher() { return <Suspense fallback={<main className="page"><Chargement /></main>}><Contenu /></Suspense>; }
