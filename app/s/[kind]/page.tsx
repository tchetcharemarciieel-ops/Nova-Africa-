"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Carte from "@/components/Carte";
import { api, messageErreur, type Signalement } from "@/lib/api";
import { KINDS, QUARTIERS, estKind } from "@/lib/constants";

export default function Section() {
  const { kind } = useParams<{ kind: string }>();
  const [liste, setListe] = useState<Signalement[] | null>(null);
  const [lieu, setLieu] = useState("");
  const [erreur, setErreur] = useState("");
  const valide = estKind(String(kind));
  const charger = useCallback(() => {
    if (!estKind(String(kind))) return;
    api.list(kind as never, lieu).then(r => { setListe(r); setErreur(""); }).catch(e => { setListe(l => l ?? []); setErreur(messageErreur(e)); });
  }, [kind, lieu]);
  useEffect(() => { setListe(null); charger(); const t = setInterval(charger, 30000); return () => clearInterval(t); }, [charger]);

  if (!valide) return <main className="page"><h1>Page introuvable</h1><Link className="btn" href="/">Retour</Link></main>;
  const m = KINDS[kind as keyof typeof KINDS];
  const lieux = Array.from(new Set([...(liste ?? []).map(s => s.lieu), ...QUARTIERS])).sort();
  return (
    <main className="page">
      <h1 style={{ color: m.couleur }}>{m.nom}</h1>
      <p className="mute petit">{kind === "prix" ? "Relevés des 7 derniers jours" : "Signalements des dernières 24 heures"} · le plus récent par lieu et par produit.</p>
      <label htmlFor="lieu" style={{ marginTop: 12 }}>{m.lieuLabel}</label>
      <select id="lieu" value={lieu} onChange={e => setLieu(e.target.value)}><option value="">Tous</option>{lieux.map(l => <option key={l}>{l}</option>)}</select>
      {erreur && <p className="err" role="alert">{erreur}</p>}
      <div style={{ marginTop: 14 }} aria-live="polite">
        {liste === null ? <p className="mute" role="status">Chargement…</p>
          : liste.length === 0 && !erreur ? <p className="vide">{m.vide} <Link href={`/signaler?kind=${kind}`}>Sois le premier à signaler.</Link></p>
          : liste.map(s => <Carte key={s.id} s={s} onVote={charger} />)}
      </div>
      <Link href={`/signaler?kind=${kind}`} className="btn noir bloc">Signaler : {m.nom.toLowerCase()}</Link>
    </main>
  );
}
