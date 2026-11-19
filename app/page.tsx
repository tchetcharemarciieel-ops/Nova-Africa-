"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icone from "@/components/Icone";
import { api, messageErreur, type Resume } from "@/lib/api";
import { KINDS, ORDRE, depuis } from "@/lib/constants";

export default function Aujourdhui() {
  const [r, setR] = useState<Resume | null>(null);
  const [erreur, setErreur] = useState("");
  useEffect(() => { api.summary().then(setR).catch(e => setErreur(messageErreur(e))); }, []);
  return (
    <main className="page">
      <h1>Ce qui compte aujourd&apos;hui.</h1>
      <p className="mute">Carburant, prix, coupures, alertes : signalés par les habitants de Bangui, confirmés par d&apos;autres.</p>
      {erreur && <p className="err" role="alert">{erreur}</p>}
      <div className="grille">
        {ORDRE.map(k => {
          const m = KINDS[k], d = r?.[k];
          return (
            <Link key={k} href={`/s/${k}`} className="tuile" style={{ ["--c" as string]: m.couleur }}>
              <span className="ico"><Icone nom={k} /></span>
              <b>{r ? d?.n ?? 0 : "–"}</b>
              <span className="l">{m.nom}</span>
              <small>{r ? (d && d.n > 0 && d.derniere ? `Dernier : ${depuis(d.derniere)}` : "Aucun signalement") : "Chargement…"}</small>
            </Link>
          );
        })}
      </div>
      <Link href="/signaler" className="btn noir bloc"><Icone nom="plus" taille={18} /> J&apos;ai vu quelque chose</Link>
      <div className="info" style={{ marginTop: 14 }}><b>Comment ça marche :</b> tu lis sans inscription. Pour signaler, un prénom suffit. Chaque information montre depuis quand elle date, et d&apos;autres personnes peuvent la confirmer ou dire qu&apos;elle n&apos;est plus vraie.</div>
      <p className="mute petit">Les informations viennent des habitants : elles peuvent être fausses ou dépassées. Vérifie avant de te déplacer.</p>
    </main>
  );
}
