"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LIEUX, TYPES_OFFRE, normalizePhone, saveOffre, uid } from "@/lib/data";

export default function NouvelleOffre() {
  const router = useRouter();
  const [erreur, setErreur] = useState("");
  function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const titre = String(f.get("titre") || "").trim().slice(0, 80);
    const organisation = String(f.get("organisation") || "").trim().slice(0, 60);
    const lieu = String(f.get("lieu") || "");
    const type = String(f.get("type") || "");
    const details = String(f.get("details") || "").trim().slice(0, 300);
    const telephone = normalizePhone(String(f.get("telephone") || ""));
    if (titre.length < 5) return setErreur("Écris le poste, par exemple « Comptable junior ».");
    if (organisation.length < 2) return setErreur("Écris le nom de l'entreprise ou de l'organisation.");
    if (!(LIEUX as readonly string[]).includes(lieu)) return setErreur("Choisis le lieu.");
    if (!(TYPES_OFFRE as readonly string[]).includes(type)) return setErreur("Choisis le type d'offre.");
    if (!telephone) return setErreur("Écris un numéro WhatsApp pour recevoir les candidatures.");
    if (!saveOffre({ id: uid(), titre, organisation, lieu, type, details, telephone, creeLe: new Date().toISOString() })) return setErreur("Impossible d'enregistrer. Réessaie.");
    router.push("/emplois");
  }
  return (
    <main className="wrap">
      <h1>Publier une offre</h1>
      <p className="lead">Les candidats te contactent sur WhatsApp, avec leur carte pro.</p>
      <form onSubmit={envoyer} noValidate>
        <label htmlFor="titre">Poste</label><input id="titre" name="titre" maxLength={80} placeholder="Ex. Comptable junior" />
        <label htmlFor="organisation">Entreprise ou organisation</label><input id="organisation" name="organisation" maxLength={60} />
        <label htmlFor="type">Type</label><select id="type" name="type" defaultValue=""><option value="" disabled>Choisir…</option>{TYPES_OFFRE.map(t => <option key={t}>{t}</option>)}</select>
        <label htmlFor="lieu">Lieu</label><select id="lieu" name="lieu" defaultValue=""><option value="" disabled>Choisir…</option>{LIEUX.map(l => <option key={l}>{l}</option>)}</select>
        <label htmlFor="details">Détails (facultatif)</label><textarea id="details" name="details" maxLength={300} />
        <label htmlFor="telephone">Numéro WhatsApp pour les candidatures</label><input id="telephone" name="telephone" type="tel" inputMode="tel" autoComplete="tel" />
        {erreur && <p className="err" role="alert">{erreur}</p>}
        <p style={{ marginTop: 20 }}><button className="btn b2" type="submit" style={{ width: "100%" }}>Publier l&apos;offre</button></p>
        <p className="note">Une vraie offre ne demande jamais d&apos;argent au candidat.</p>
      </form>
    </main>
  );
}
