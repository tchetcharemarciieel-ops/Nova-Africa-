"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, messageErreur, type Moi } from "@/lib/api";
import { KINDS, ORDRE, QUARTIERS, estKind, type Kind } from "@/lib/constants";
import { assurerMoi, moi } from "@/lib/session";

function Formulaire() {
  const router = useRouter();
  const sp = useSearchParams();
  const initial = sp.get("kind") || "carburant";
  const [kind, setKind] = useState<Kind>(estKind(initial) ? initial : "carburant");
  const [me, setMe] = useState<Moi | null | undefined>(undefined);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  useEffect(() => { moi().then(setMe).catch(() => setMe(null)); }, []);
  const m = KINDS[kind];

  async function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const lieu = String(f.get("lieu") || "").trim().slice(0, 60);
    const objet = String(f.get("objet") || "");
    const etat = String(f.get("etat") || "");
    const note = String(f.get("note") || "").trim().slice(0, 140);
    const brut = String(f.get("valeur") || "").replace(/\s/g, "");
    const valeur = brut ? Number(brut) : null;
    const nom = String(f.get("nom") || "").trim().slice(0, 30);
    if (lieu.length < 2) return setErreur(`Écris le lieu (${m.lieuLabel.toLowerCase()}).`);
    if (!m.objets.includes(objet)) return setErreur("Choisis ce que tu as vu.");
    if (!m.etats.some(x => x[0] === etat)) return setErreur("Choisis l'état.");
    if (m.prix === "requis" && valeur === null) return setErreur("Écris le prix relevé.");
    if (valeur !== null && (!Number.isInteger(valeur) || valeur < 0 || valeur > 10000000)) return setErreur("Écris un prix en chiffres, par exemple 1150.");
    if (m.noteRequise && note.length < 5) return setErreur("Décris en quelques mots ce qui se passe.");
    if (!me && nom.length < 2) return setErreur("Écris ton prénom (2 lettres au moins).");
    setErreur(""); setEnvoi(true);
    try { const { secret } = await assurerMoi(nom); await api.report(secret, kind, lieu, objet, etat, valeur, note); router.push(`/s/${kind}`); }
    catch (err) { setErreur(messageErreur(err)); setEnvoi(false); }
  }

  return (
    <main className="page">
      <h1>Signaler</h1>
      <p className="mute">Dis ce que tu as vu. Ça prend 20 secondes.</p>
      <form onSubmit={envoyer} noValidate key={kind}>
        <fieldset style={{ border: 0 }}><legend style={{ fontWeight: 700, margin: "16px 0 6px" }}>Quoi ?</legend>
          <div className="choix">{ORDRE.map(k => <label key={k}><input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} /><span>{KINDS[k].court}</span></label>)}</div></fieldset>
        <label htmlFor="lieu">{m.lieuLabel}</label>
        <input id="lieu" name="lieu" list="lieux" maxLength={60} placeholder={m.lieuAide} autoComplete="off" />
        <datalist id="lieux">{QUARTIERS.map(q => <option key={q} value={q} />)}</datalist>
        <fieldset style={{ border: 0 }}><legend style={{ fontWeight: 700, margin: "16px 0 6px" }}>Ce que tu as vu</legend>
          <div className="choix">{m.objets.map(o => <label key={o}><input type="radio" name="objet" value={o} /><span>{o}</span></label>)}</div></fieldset>
        <fieldset style={{ border: 0 }}><legend style={{ fontWeight: 700, margin: "16px 0 6px" }}>État</legend>
          <div className="choix">{m.etats.map(([x]) => <label key={x}><input type="radio" name="etat" value={x} /><span>{x}</span></label>)}</div></fieldset>
        {m.prix !== "non" && <><label htmlFor="valeur">Prix en FCFA {m.prix === "option" ? "(facultatif)" : ""}</label><input id="valeur" name="valeur" inputMode="numeric" placeholder="Ex. 1150" /></>}
        <label htmlFor="note">{m.noteRequise ? "Ce qui se passe" : "Un détail (facultatif)"}</label>
        <textarea id="note" name="note" maxLength={140} />
        {me === null && <><label htmlFor="nom">Ton prénom</label><input id="nom" name="nom" maxLength={30} autoComplete="given-name" /></>}
        {erreur && <p className="err" role="alert">{erreur}</p>}
        <p style={{ marginTop: 18 }}><button className="btn noir bloc" type="submit" disabled={envoi || me === undefined}>{envoi ? "Envoi…" : "Envoyer mon signalement"}</button></p>
        <p className="mute petit">Ne signale que ce que tu as vu toi-même. Pas de noms de personnes, pas d&apos;accusations.</p>
      </form>
    </main>
  );
}
export default function Signaler() { return <Suspense fallback={<main className="page"><p className="mute">Chargement…</p></main>}><Formulaire /></Suspense>; }
