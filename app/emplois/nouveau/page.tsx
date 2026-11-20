"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chargement, Erreur, Verifiee } from "@/components/Blocs";
import { LIEUX, TYPES_OFFRE } from "@/lib/constants";
import { api, messageErreur, type Me } from "@/lib/api";
import { getSecret, moi } from "@/lib/session";

export default function NouvelleOffre() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  useEffect(() => { moi().then(setMe).catch(() => setMe(null)); }, []);

  if (me === undefined) return <main className="page"><Chargement /></main>;
  if (!me?.org_slug) return (
    <main className="page"><section className="carte"><div className="in">
      <h1>Publier une offre</h1>
      <p className="lead">Les offres d&apos;emploi sont réservées aux entreprises et ONG inscrites : c&apos;est ce qui permet de lutter contre les fausses offres.</p>
      <div className="lignes"><Link className="btn plein" href="/inscription-entreprise">Inscrire mon entreprise</Link>{me && <Link className="btn" href="/moi">Mon compte</Link>}</div>
    </div></section></main>
  );

  async function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const titre = String(f.get("titre") || "").trim().slice(0, 80);
    const lieu = String(f.get("lieu") || "");
    const type = String(f.get("type") || "");
    const details = String(f.get("details") || "").trim().slice(0, 300);
    if (titre.length < 5) return setErreur("Écris le poste, par exemple « Comptable junior ».");
    if (!(LIEUX as readonly string[]).includes(lieu)) return setErreur("Choisis le lieu.");
    if (!(TYPES_OFFRE as readonly string[]).includes(type)) return setErreur("Choisis le type d'offre.");
    setErreur(""); setEnvoi(true);
    try { await api.orgPostJob(getSecret(), titre, lieu, type, details); router.push("/emplois"); }
    catch (err) { setErreur(messageErreur(err)); setEnvoi(false); }
  }
  return (
    <main className="page"><section className="carte"><div className="in">
      <h1>Publier une offre</h1>
      <p className="lead">Les candidats t&apos;écrivent par message dans l&apos;application. {me.org_statut === "verifiee" ? <Verifiee /> : <Verifiee attente />}</p>
      <form onSubmit={envoyer} noValidate>
        <label htmlFor="titre">Poste</label><input id="titre" name="titre" maxLength={80} placeholder="Ex. Comptable junior" />
        <label htmlFor="type">Type</label><select id="type" name="type" defaultValue=""><option value="" disabled>Choisir…</option>{TYPES_OFFRE.map(t => <option key={t}>{t}</option>)}</select>
        <label htmlFor="lieu">Lieu</label><select id="lieu" name="lieu" defaultValue=""><option value="" disabled>Choisir…</option>{LIEUX.map(l => <option key={l}>{l}</option>)}</select>
        <label htmlFor="details">Détails (facultatif)</label><textarea id="details" name="details" maxLength={300} />
        {erreur && <Erreur texte={erreur} />}
        <p style={{ marginTop: 18 }}><button className="btn plein bloc" type="submit" disabled={envoi}>{envoi ? "Publication…" : "Publier l'offre"}</button></p>
        <p className="mute petit">Une vraie offre ne demande jamais d&apos;argent au candidat. <Link href="/cgu">Voir les règles</Link>.</p>
      </form>
    </div></section></main>
  );
}
