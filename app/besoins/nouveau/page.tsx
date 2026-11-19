"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Erreur } from "@/components/Blocs";
import { LIEUX, METIERS } from "@/lib/constants";
import { api, messageErreur, type Me } from "@/lib/api";
import { assurerMoi, moi } from "@/lib/session";

export default function NouveauBesoin() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  useEffect(() => { moi().then(setMe).catch(() => setMe(null)); }, []);

  async function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const titre = String(f.get("titre") || "").trim().slice(0, 80);
    const metier = String(f.get("metier") || "");
    const lieu = String(f.get("lieu") || "");
    const details = String(f.get("details") || "").trim().slice(0, 300);
    const nom = String(f.get("nom") || "").trim().slice(0, 60);
    if (titre.length < 5) return setErreur("Écris ton besoin en quelques mots, par exemple « Plombier demain matin ».");
    if (!(METIERS as readonly string[]).includes(metier)) return setErreur("Choisis le métier recherché.");
    if (!(LIEUX as readonly string[]).includes(lieu)) return setErreur("Choisis le quartier.");
    if (!me && nom.length < 2) return setErreur("Écris ton nom pour que les professionnels sachent à qui répondre.");
    setErreur(""); setEnvoi(true);
    try { const { secret } = await assurerMoi(nom); await api.postNeed(secret, titre, metier, lieu, details); router.push("/besoins"); }
    catch (err) { setErreur(messageErreur(err)); setEnvoi(false); }
  }
  return (
    <main className="page"><section className="carte"><div className="in">
      <h1>J&apos;ai besoin de…</h1>
      <p className="lead">Décris ton besoin. Les professionnels te répondent par message dans l&apos;application.</p>
      <form onSubmit={envoyer} noValidate>
        <label htmlFor="titre">Ton besoin</label><input id="titre" name="titre" maxLength={80} placeholder="Ex. Plombier demain matin" />
        <label htmlFor="metier">Métier recherché</label><select id="metier" name="metier" defaultValue=""><option value="" disabled>Choisir…</option>{METIERS.map(m => <option key={m}>{m}</option>)}</select>
        <label htmlFor="lieu">Quartier</label><select id="lieu" name="lieu" defaultValue=""><option value="" disabled>Choisir…</option>{LIEUX.map(l => <option key={l}>{l}</option>)}</select>
        <label htmlFor="details">Détails (facultatif)</label><textarea id="details" name="details" maxLength={300} />
        {me === null && <><label htmlFor="nom">Ton nom</label><input id="nom" name="nom" autoComplete="name" maxLength={60} /></>}
        {erreur && <Erreur texte={erreur} />}
        <p style={{ marginTop: 18 }}><button className="btn plein bloc" type="submit" disabled={envoi || me === undefined}>{envoi ? "Publication…" : "Publier mon besoin"}</button></p>
        <p className="mute petit">Ne publie jamais de mot de passe, de code ni de numéro de carte.</p>
      </form>
    </div></section></main>
  );
}
