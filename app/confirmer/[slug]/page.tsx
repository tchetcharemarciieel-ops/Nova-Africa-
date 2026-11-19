"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { findCard, saveConfirmation, uid, type Card } from "@/lib/data";

export default function Confirmer() {
  const { slug } = useParams<{ slug: string }>();
  const [card, setCard] = useState<Card | null | undefined>(undefined);
  const [fait, setFait] = useState(false);
  const [pasEncore, setPasEncore] = useState(false);
  const [erreur, setErreur] = useState("");
  useEffect(() => { setCard(findCard(String(slug)) ?? null); }, [slug]);

  if (card === undefined) return <main className="wrap"><p className="note" role="status">Chargement…</p></main>;
  if (card === null) return <main className="wrap"><h1>Carte introuvable</h1><p className="lead">Cette carte n&apos;existe pas sur ce téléphone. Dans cette version de test, les confirmations ne marchent que sur le téléphone du professionnel.</p><Link className="btn b2" href="/">Accueil</Link></main>;
  if (fait) return <main className="wrap"><h1>Merci !</h1><p className="lead">Ta confirmation est enregistrée. Elle aide les prochains clients à choisir.</p><Link className="btn b1" href={`/p/${card.slug}`}>Voir la carte de {card.nom}</Link></main>;
  if (pasEncore) return <main className="wrap"><h1>Pas de souci</h1><p className="lead">Reviens quand le travail sera terminé. Une confirmation compte seulement après le travail.</p><Link className="btn b3" href="/">Accueil</Link></main>;

  function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const travail = String(f.get("travail") || "").trim().slice(0, 80);
    const note = Number(f.get("note"));
    const avis = String(f.get("avis") || "").trim().slice(0, 200);
    const prenom = String(f.get("prenom") || "").trim().slice(0, 30);
    if (travail.length < 3) return setErreur("Dis en quelques mots quel travail a été fait.");
    if (!(note >= 1 && note <= 5)) return setErreur("Choisis une note de 1 à 5.");
    if (!saveConfirmation({ id: uid(), slug: card!.slug, travail, note, avis, prenom, creeLe: new Date().toISOString() })) return setErreur("Impossible d'enregistrer. Réessaie.");
    setFait(true);
  }

  return (
    <main className="wrap">
      <h1>Confirmer un travail</h1>
      <p className="lead"><b>{card.nom}</b> ({card.metier}) te demande de confirmer le travail qu&apos;il a fait pour toi.</p>
      <form onSubmit={envoyer} noValidate>
        <label htmlFor="travail">Quel travail a été fait ?</label>
        <input id="travail" name="travail" maxLength={80} placeholder="Ex. Plomberie, salle de bain" />
        <fieldset style={{ border: 0, marginTop: 14 }}>
          <legend style={{ fontWeight: 700, marginBottom: 6 }}>Ta note</legend>
          <div className="note-stars">{[1, 2, 3, 4, 5].map(n => <label key={n}><input type="radio" name="note" value={n} /><span>{n}</span></label>)}</div>
        </fieldset>
        <label htmlFor="avis">Quelques mots (facultatif)</label>
        <textarea id="avis" name="avis" maxLength={200} />
        <label htmlFor="prenom">Ton prénom (facultatif)</label>
        <input id="prenom" name="prenom" maxLength={30} autoComplete="given-name" />
        {erreur && <p className="err" role="alert">{erreur}</p>}
        <div className="row" style={{ marginTop: 18 }}>
          <button className="btn b1" type="submit">Oui, le travail est fait</button>
          <button className="btn b3" type="button" onClick={() => setPasEncore(true)}>Pas encore</button>
        </div>
        <div className="rule"><b>Notre règle :</b> ton avis est publié tel quel. On ne le retire que s&apos;il est faux ou injurieux, et on te dit pourquoi. Personne ne peut payer pour le faire disparaître.</div>
      </form>
    </main>
  );
}
