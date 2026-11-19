"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LIEUX, METIERS, normalizePhone, saveBesoin, uid } from "@/lib/data";

export default function NouveauBesoin() {
  const router = useRouter();
  const [erreur, setErreur] = useState("");
  function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const titre = String(f.get("titre") || "").trim().slice(0, 80);
    const metier = String(f.get("metier") || "");
    const lieu = String(f.get("lieu") || "");
    const details = String(f.get("details") || "").trim().slice(0, 300);
    const telephone = normalizePhone(String(f.get("telephone") || ""));
    if (titre.length < 5) return setErreur("Écris ton besoin en quelques mots, par exemple « Plombier demain ».");
    if (!(METIERS as readonly string[]).includes(metier)) return setErreur("Choisis le métier recherché.");
    if (!(LIEUX as readonly string[]).includes(lieu)) return setErreur("Choisis le quartier.");
    if (!telephone) return setErreur("Écris ton numéro WhatsApp pour que les professionnels te répondent.");
    if (!saveBesoin({ id: uid(), titre, metier, lieu, details, telephone, creeLe: new Date().toISOString() })) return setErreur("Impossible d'enregistrer. Réessaie.");
    router.push("/besoins");
  }
  return (
    <main className="wrap">
      <h1>J&apos;ai besoin de…</h1>
      <p className="lead">Décris ton besoin. Les professionnels te répondent sur WhatsApp.</p>
      <form onSubmit={envoyer} noValidate>
        <label htmlFor="titre">Ton besoin</label><input id="titre" name="titre" maxLength={80} placeholder="Ex. Plombier demain matin" />
        <label htmlFor="metier">Métier recherché</label><select id="metier" name="metier" defaultValue=""><option value="" disabled>Choisir…</option>{METIERS.map(m => <option key={m}>{m}</option>)}</select>
        <label htmlFor="lieu">Quartier</label><select id="lieu" name="lieu" defaultValue=""><option value="" disabled>Choisir…</option>{LIEUX.map(l => <option key={l}>{l}</option>)}</select>
        <label htmlFor="details">Détails (facultatif)</label><textarea id="details" name="details" maxLength={300} />
        <label htmlFor="telephone">Ton numéro WhatsApp</label><input id="telephone" name="telephone" type="tel" inputMode="tel" autoComplete="tel" placeholder="70 12 34 56" />
        {erreur && <p className="err" role="alert">{erreur}</p>}
        <p style={{ marginTop: 20 }}><button className="btn b2" type="submit" style={{ width: "100%" }}>Publier mon besoin</button></p>
        <p className="note">Ton numéro sera visible. Ne publie jamais de mot de passe, de code ou de numéro de carte.</p>
      </form>
    </main>
  );
}
