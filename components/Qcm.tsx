"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Icone from "./Icone";
import { api } from "@/lib/api";
import { enregistrer, jourBangui, scoreDuJour, type Jeu, type Question } from "@/lib/jeux";
import { secretExistant } from "@/lib/session";

/** Série de 5 questions à choix : 20 points par bonne réponse, un seul score par jour. */
export default function Qcm({ jeu, titre, questions }: { jeu: Jeu; titre: string; questions: Question[] }) {
  const [i, setI] = useState(0);
  const [choix, setChoix] = useState<number | null>(null);
  const [bonnes, setBonnes] = useState(0);
  const [fin, setFin] = useState<number | null>(null);
  const [deja, setDeja] = useState<number | null | undefined>(undefined);
  useEffect(() => { setDeja(scoreDuJour(jeu)); }, [jeu]);
  const q = questions[i];
  const points = useMemo(() => bonnes * 20, [bonnes]);

  function repondre(k: number) {
    if (choix !== null) return;
    setChoix(k); if (k === q.bonne) setBonnes(b => b + 1);
  }
  async function suivant() {
    if (i + 1 < questions.length) { setI(i + 1); setChoix(null); return; }
    const p = bonnes * 20; enregistrer(jeu, p); setFin(p);
    const s = secretExistant(); if (s) { try { await api.saveScore(s, jeu, jourBangui(), p); } catch { /* le score reste sur le téléphone */ } }
  }
  if (deja === undefined) return null;
  if (deja !== null || fin !== null) {
    const p = fin ?? deja ?? 0;
    return (
      <section className="carte"><div className="in jeu-fin">
        <span className="vide-ico"><Icone nom="etoile" taille={30} trait={1.6} /></span>
        <h1>{p} / 100</h1>
        <p className="lead">{fin !== null ? "Bien joué !" : "Tu as déjà joué aujourd'hui."} Reviens demain pour une nouvelle série.</p>
        <div className="lignes" style={{ justifyContent: "center" }}><Link className="btn plein" href="/jeux">Voir les jeux</Link></div>
      </div></section>
    );
  }
  return (
    <section className="carte"><div className="in">
      <p className="mute petit">{titre} · question {i + 1} sur {questions.length}</p>
      <div className="jeu-barre" aria-hidden="true"><i style={{ width: `${((i + (choix !== null ? 1 : 0)) / questions.length) * 100}%` }} /></div>
      <h1 style={{ fontSize: 22, marginTop: 14 }}>{q.q}</h1>
      <div className="jeu-options" role="group" aria-label="Réponses">
        {q.options.map((o, k) => {
          const etat = choix === null ? "" : k === q.bonne ? " bon" : k === choix ? " mauvais" : "";
          return <button key={k} type="button" className={`jeu-opt${etat}`} onClick={() => repondre(k)} disabled={choix !== null}>{o}</button>;
        })}
      </div>
      {choix !== null && (
        <div role="status" className={`jeu-retour ${choix === q.bonne ? "ok" : "non"}`}>
          <b>{choix === q.bonne ? "Bonne réponse !" : "Pas tout à fait."}</b> {q.aide}
          <p style={{ marginTop: 12 }}><button type="button" className="btn plein bloc" onClick={suivant}>{i + 1 < questions.length ? "Question suivante" : "Voir mon score"}</button></p>
        </div>
      )}
    </div></section>
  );
}
