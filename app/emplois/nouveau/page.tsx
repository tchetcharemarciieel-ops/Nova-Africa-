"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Erreur } from "@/components/Blocs";
import { LIEUX, TYPES_OFFRE } from "@/lib/constants";
import { api, messageErreur, type Me } from "@/lib/api";
import { assurerMoi, moi } from "@/lib/session";

export default function NouvelleOffre() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  useEffect(() => { moi().then(setMe).catch(() => setMe(null)); }, []);

  async function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const titre = String(f.get("titre") || "").trim().slice(0, 80);
    const organisation = String(f.get("organisation") || "").trim().slice(0, 60);
    const lieu = String(f.get("lieu") || "");
    const type = String(f.get("type") || "");
    const details = String(f.get("details") || "").trim().slice(0, 300);
    const nom = String(f.get("nom") || "").trim().slice(0, 60);
    if (titre.length < 5) return setErreur("Écris le poste, par exemple « Comptable junior ».");
    if (organisation.length < 2) return setErreur("Écris le nom de l'entreprise ou de l'organisation.");
    if (!(LIEUX as readonly string[]).includes(lieu)) return setErreur("Choisis le lieu.");
    if (!(TYPES_OFFRE as readonly string[]).includes(type)) return setErreur("Choisis le type d'offre.");
    if (!me && nom.length < 2) return setErreur("Écris ton nom pour recevoir les candidatures.");
    setErreur(""); setEnvoi(true);
    try { const { secret } = await assurerMoi(nom); await api.postJob(secret, titre, organisation, lieu, type, details); router.push("/emplois"); }
    catch (err) { setErreur(messageErreur(err)); setEnvoi(false); }
  }
  return (
    <main className="page"><section className="carte"><div className="in">
      <h1>Publier une offre</h1>
      <p className="lead">Les candidats t&apos;écrivent par message dans l&apos;application.</p>
      <form onSubmit={envoyer} noValidate>
        <label htmlFor="titre">Poste</label><input id="titre" name="titre" maxLength={80} placeholder="Ex. Comptable junior" />
        <label htmlFor="organisation">Entreprise ou organisation</label><input id="organisation" name="organisation" maxLength={60} />
        <label htmlFor="type">Type</label><select id="type" name="type" defaultValue=""><option value="" disabled>Choisir…</option>{TYPES_OFFRE.map(t => <option key={t}>{t}</option>)}</select>
        <label htmlFor="lieu">Lieu</label><select id="lieu" name="lieu" defaultValue=""><option value="" disabled>Choisir…</option>{LIEUX.map(l => <option key={l}>{l}</option>)}</select>
        <label htmlFor="details">Détails (facultatif)</label><textarea id="details" name="details" maxLength={300} />
        {me === null && <><label htmlFor="nom">Ton nom</label><input id="nom" name="nom" autoComplete="name" maxLength={60} /></>}
        {erreur && <Erreur texte={erreur} />}
        <p style={{ marginTop: 18 }}><button className="btn plein bloc" type="submit" disabled={envoi || me === undefined}>{envoi ? "Publication…" : "Publier l'offre"}</button></p>
        <p className="mute petit">Une vraie offre ne demande jamais d&apos;argent au candidat.</p>
      </form>
    </div></section></main>
  );
}
