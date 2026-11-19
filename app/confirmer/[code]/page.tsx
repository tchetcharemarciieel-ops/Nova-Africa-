"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Chargement, Erreur } from "@/components/Blocs";
import { api, messageErreur } from "@/lib/api";

export default function Confirmer() {
  const { code } = useParams<{ code: string }>();
  const [pro, setPro] = useState<{ nom: string; metier: string } | null | undefined>(undefined);
  const [fini, setFini] = useState<string | null>(null);
  const [pasEncore, setPasEncore] = useState(false);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  useEffect(() => { api.inviteInfo(String(code)).then(setPro).catch(() => setPro(null)); }, [code]);

  if (pro === undefined) return <main className="page"><Chargement /></main>;
  if (fini) return <main className="page"><section className="carte"><div className="in"><h1>Merci !</h1><p className="lead">Ta confirmation est enregistrée. Elle aide les prochains clients à choisir.</p><Link className="btn plein" href={`/p/${fini}`}>Voir la carte</Link></div></section></main>;
  if (!pro) return <main className="page"><section className="carte"><div className="in"><h1>Lien non valable</h1><p className="lead">Ce lien de confirmation n&apos;existe pas ou a déjà été utilisé. Demande-en un nouveau au professionnel.</p><Link className="btn" href="/">Accueil</Link></div></section></main>;
  if (pasEncore) return <main className="page"><section className="carte"><div className="in"><h1>Pas de souci</h1><p className="lead">Reviens quand le travail sera terminé : une confirmation compte seulement après le travail.</p></div></section></main>;

  async function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const travail = String(f.get("travail") || "").trim().slice(0, 80);
    const note = Number(f.get("note"));
    const avis = String(f.get("avis") || "").trim().slice(0, 200);
    const prenom = String(f.get("prenom") || "").trim().slice(0, 30);
    if (travail.length < 3) return setErreur("Dis en quelques mots quel travail a été fait.");
    if (!(note >= 1 && note <= 5)) return setErreur("Choisis une note de 1 à 5.");
    setErreur(""); setEnvoi(true);
    try { setFini(await api.confirm(String(code), travail, note, avis, prenom)); } catch (err) { setErreur(messageErreur(err)); setEnvoi(false); }
  }

  return (
    <main className="page"><section className="carte"><div className="in">
      <h1>Confirmer un travail</h1>
      <p className="lead"><b>{pro.nom}</b> ({pro.metier}) te demande de confirmer le travail qu&apos;il a fait pour toi. Ça prend une minute, sans inscription.</p>
      <form onSubmit={envoyer} noValidate>
        <label htmlFor="travail">Quel travail a été fait ?</label><input id="travail" name="travail" maxLength={80} placeholder="Ex. Plomberie, salle de bain" />
        <fieldset style={{ border: 0, marginTop: 14 }}><legend style={{ fontWeight: 700, marginBottom: 6 }}>Ta note</legend>
          <div className="notes">{[1, 2, 3, 4, 5].map(n => <label key={n}><input type="radio" name="note" value={n} /><span>{n}</span></label>)}</div></fieldset>
        <label htmlFor="avis">Quelques mots (facultatif)</label><textarea id="avis" name="avis" maxLength={200} />
        <label htmlFor="prenom">Ton prénom (facultatif)</label><input id="prenom" name="prenom" maxLength={30} autoComplete="given-name" />
        {erreur && <Erreur texte={erreur} />}
        <div className="lignes" style={{ marginTop: 16 }}>
          <button className="btn plein" type="submit" disabled={envoi}>{envoi ? "Envoi…" : "Oui, le travail est fait"}</button>
          <button className="btn" type="button" onClick={() => setPasEncore(true)}>Pas encore</button>
        </div>
        <p className="info" style={{ marginTop: 14 }}><b>Notre règle :</b> ton avis est publié tel quel. On ne le retire que s&apos;il est faux ou injurieux, et on te dit pourquoi. Personne ne peut payer pour le faire disparaître.</p>
      </form>
    </div></section></main>
  );
}
