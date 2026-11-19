"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LANGUES, LIEUX, METIERS, normalizePhone, saveCard, slugify, type Card } from "@/lib/cards";

export default function Creer() {
  const router = useRouter();
  const [erreur, setErreur] = useState("");

  function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const nom = String(f.get("nom") || "").trim().slice(0, 60);
    const metier = String(f.get("metier") || "");
    const lieu = String(f.get("lieu") || "");
    const telephone = normalizePhone(String(f.get("telephone") || ""));
    const apropos = String(f.get("apropos") || "").trim().slice(0, 300);
    const langues = f.getAll("langues").map(String).filter(l => (LANGUES as readonly string[]).includes(l));
    if (nom.length < 2) return setErreur("Écris ton nom (au moins 2 lettres).");
    if (!(METIERS as readonly string[]).includes(metier)) return setErreur("Choisis ton métier.");
    if (!(LIEUX as readonly string[]).includes(lieu)) return setErreur("Choisis où tu travailles.");
    if (!telephone) return setErreur("Écris ton numéro WhatsApp, par exemple 70 12 34 56 (ou avec l'indicatif du pays).");
    const card: Card = { slug: slugify(nom), nom, metier, lieu, telephone, apropos, langues, creeLe: new Date().toISOString() };
    if (!saveCard(card)) return setErreur("Impossible d'enregistrer sur ce téléphone. Réessaie.");
    router.push(`/p/${card.slug}?nouveau=1`);
  }

  return (
    <main className="wrap">
      <h1>Ma carte pro</h1>
      <p className="lead">Deux minutes. Pas de mot de passe.</p>
      <form onSubmit={envoyer} noValidate>
        <label htmlFor="nom">Ton nom</label>
        <input id="nom" name="nom" autoComplete="name" required maxLength={60} placeholder="Ex. Joseph Ngaïkosset" />
        <label htmlFor="metier">Ton métier</label>
        <select id="metier" name="metier" defaultValue="">
          <option value="" disabled>Choisir…</option>
          {METIERS.map(m => <option key={m}>{m}</option>)}
        </select>
        <label htmlFor="lieu">Où tu travailles</label>
        <select id="lieu" name="lieu" defaultValue="">
          <option value="" disabled>Choisir…</option>
          {LIEUX.map(l => <option key={l}>{l}</option>)}
        </select>
        <label htmlFor="telephone">Numéro WhatsApp</label>
        <input id="telephone" name="telephone" type="tel" inputMode="tel" autoComplete="tel" placeholder="70 12 34 56" />
        <label htmlFor="apropos">Ce que tu sais faire (facultatif)</label>
        <textarea id="apropos" name="apropos" maxLength={300} placeholder="Ex. 8 ans d'expérience, travaux de plomberie et de salle de bain." />
        <label>Langues</label>
        <div className="checks">
          {LANGUES.map(l => <label key={l}><input type="checkbox" name="langues" value={l} defaultChecked={l === "Français"} /> {l}</label>)}
        </div>
        {erreur && <p className="err" role="alert">{erreur}</p>}
        <p style={{ marginTop: 20 }}><button className="btn or" type="submit">Créer ma carte</button></p>
        <p className="note">Ton numéro sera visible sur ta carte. Ne l&apos;écris que si tu veux être contacté.</p>
      </form>
    </main>
  );
}
