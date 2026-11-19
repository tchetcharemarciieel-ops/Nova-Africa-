"use client";

import { useState } from "react";
import { api, messageErreur, type Signalement } from "@/lib/api";
import { assurerMoi, secretExistant } from "@/lib/session";
import { depuis, fcfa, fraicheur, tonDe } from "@/lib/constants";

export default function Carte({ s, onVote }: { s: Signalement; onVote: () => void }) {
  const [demande, setDemande] = useState<boolean | null>(null);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function voter(ok: boolean, nom?: string) {
    setErreur(""); setEnvoi(true);
    try {
      const { secret } = await assurerMoi(nom);
      await api.vote(secret, s.id, ok);
      setDemande(null); onVote();
    } catch (e) {
      if (e && (e as { code?: string }).code === "BA_NOM") { setDemande(ok); setErreur(""); }
      else setErreur(messageErreur(e));
    }
    setEnvoi(false);
  }
  const clic = (ok: boolean) => { if (secretExistant()) voter(ok); else { setDemande(ok); } };

  return (
    <article className="carte">
      <div className="carte-t"><b>{s.lieu}</b><span className="temps"><i className={fraicheur(s.kind, s.cree_le)} aria-hidden="true" />{depuis(s.cree_le)}</span></div>
      <div className="ligne2">
        <span>{s.objet}</span>
        <span className={`pill ${tonDe(s.kind, s.etat)}`}>{s.etat}</span>
        {s.valeur != null && <span className="prix">{fcfa(s.valeur)}</span>}
      </div>
      {s.note && <p className="note">{s.note}</p>}
      <div className="pied">
        <span className="mute petit">Signalé par {s.par}</span>
        <div className="votes">
          <button type="button" className="vote" disabled={envoi} onClick={() => clic(true)} aria-label={`Encore vrai, ${s.oui} confirmations`}>Encore vrai · {s.oui}</button>
          <button type="button" className="vote" disabled={envoi} onClick={() => clic(false)} aria-label={`Plus vrai, ${s.non} contestations`}>Plus vrai · {s.non}</button>
        </div>
      </div>
      {demande !== null && (
        <form onSubmit={e => { e.preventDefault(); voter(demande, String(new FormData(e.currentTarget).get("nom") || "")); }} style={{ marginTop: 10 }}>
          <label htmlFor={`nom-${s.id}`} style={{ marginTop: 0 }}>Ton prénom, pour voter</label>
          <div style={{ display: "flex", gap: 8 }}><input id={`nom-${s.id}`} name="nom" maxLength={30} autoComplete="given-name" /><button className="btn noir" type="submit" disabled={envoi}>Valider</button></div>
        </form>
      )}
      {erreur && <p className="err" role="alert">{erreur}</p>}
    </article>
  );
}
