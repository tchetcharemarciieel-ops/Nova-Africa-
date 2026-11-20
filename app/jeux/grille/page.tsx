"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Icone from "@/components/Icone";
import { api } from "@/lib/api";
import { enregistrer, grilleDuJour, jourBangui, scoreDuJour } from "@/lib/jeux";
import { secretExistant } from "@/lib/session";

export default function Grille() {
  const jour = jourBangui();
  const { puzzle, solution } = useMemo(() => grilleDuJour(jour), [jour]);
  const [g, setG] = useState<number[][]>(() => puzzle.map(l => [...l]));
  const [sel, setSel] = useState<[number, number] | null>(null);
  const [erreurs, setErreurs] = useState(0);
  const [msg, setMsg] = useState("");
  const [fin, setFin] = useState<number | null>(null);
  const [deja, setDeja] = useState<number | null | undefined>(undefined);
  useEffect(() => { setDeja(scoreDuJour("grille")); }, []);

  function poser(n: number) {
    if (!sel || puzzle[sel[0]][sel[1]] !== 0) return;
    setG(g.map((l, r) => l.map((v, c) => (r === sel[0] && c === sel[1] ? n : v)))); setMsg("");
  }
  async function verifier() {
    if (g.flat().includes(0)) return setMsg("Remplis toutes les cases d'abord.");
    const juste = g.every((l, r) => l.every((v, c) => v === solution[r][c]));
    if (!juste) { setErreurs(e => e + 1); return setMsg("Il y a une erreur : cherche les doublons dans une ligne, une colonne ou un bloc."); }
    const p = Math.max(20, 100 - erreurs * 20); enregistrer("grille", p); setFin(p);
    const s = secretExistant(); if (s) { try { await api.saveScore(s, "grille", jour, p); } catch { /* reste sur le téléphone */ } }
  }
  if (deja === undefined) return <main className="page" />;
  if (deja !== null || fin !== null) {
    const p = fin ?? deja ?? 0;
    return (
      <main className="page"><section className="carte"><div className="in jeu-fin">
        <span className="vide-ico"><Icone nom="etoile" taille={30} trait={1.6} /></span>
        <h1>{p} / 100</h1>
        <p className="lead">{fin !== null ? "Grille réussie !" : "Tu as déjà joué aujourd'hui."} Reviens demain pour une nouvelle grille.</p>
        <div className="lignes" style={{ justifyContent: "center" }}><Link className="btn plein" href="/jeux">Voir les jeux</Link></div>
      </div></section></main>
    );
  }
  return (
    <main className="page"><section className="carte"><div className="in">
      <p className="mute petit">Grille Logique · chaque chiffre de 1 à 4 une seule fois par ligne, par colonne et par bloc de 2 × 2.</p>
      <div className="grille4" role="grid" aria-label="Grille 4 par 4">
        {g.map((l, r) => l.map((v, c) => {
          const fixe = puzzle[r][c] !== 0, actif = sel?.[0] === r && sel?.[1] === c;
          return <button key={`${r}${c}`} type="button" role="gridcell" aria-label={`Ligne ${r + 1}, colonne ${c + 1}${v ? `, ${v}` : ", vide"}`}
            className={`cell${fixe ? " fixe" : ""}${actif ? " actif" : ""}${c === 1 ? " bd" : ""}${r === 1 ? " bb" : ""}`} onClick={() => setSel([r, c])}>{v || ""}</button>;
        }))}
      </div>
      <div className="pave" role="group" aria-label="Choisir un chiffre">
        {[1, 2, 3, 4].map(n => <button key={n} type="button" className="btn" onClick={() => poser(n)}>{n}</button>)}
        <button type="button" className="btn" onClick={() => poser(0)} aria-label="Effacer">Effacer</button>
      </div>
      {msg && <p className="err" role="alert">{msg}</p>}
      <p style={{ marginTop: 14 }}><button type="button" className="btn plein bloc" onClick={verifier}>Vérifier</button></p>
      <p className="mute petit" style={{ marginTop: 8 }}>Chaque vérification ratée enlève 20 points.</p>
    </div></section></main>
  );
}
