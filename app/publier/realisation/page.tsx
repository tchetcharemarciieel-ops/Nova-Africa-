"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ChampPhoto from "@/components/ChampPhoto";
import { Chargement, Erreur } from "@/components/Blocs";
import { api, messageErreur, type Me } from "@/lib/api";
import type { Image } from "@/lib/image";
import { getSecret, moi } from "@/lib/session";

export default function Realisation() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [photo, setPhoto] = useState<Image | null>(null);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  useEffect(() => { moi().then(setMe).catch(() => setMe(null)); }, []);
  if (me === undefined) return <main className="page"><Chargement /></main>;
  if (me === null) return <main className="page"><section className="carte"><div className="in"><h1>Partager une réalisation</h1><p className="lead">Crée d&apos;abord ton compte.</p><Link className="btn plein" href="/inscription">Créer mon compte</Link></div></section></main>;

  async function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const texte = String(new FormData(e.currentTarget).get("texte") || "").trim();
    if (texte.length < 3) return setErreur("Écris quelques mots (3 lettres au moins).");
    setErreur(""); setEnvoi(true);
    try { await api.postCreate(getSecret(), texte.slice(0, 500), photo?.data ?? null, photo?.thumb ?? null); router.push("/"); }
    catch (err) { setErreur(messageErreur(err)); setEnvoi(false); }
  }
  return (
    <main className="page"><section className="carte"><div className="in">
      <h1>Partager une réalisation / actualité</h1>
      <p className="lead">Un chantier terminé, une formation suivie, une nouveauté : montre-le en photo. Ça apparaît sur le fil d&apos;accueil.</p>
      <form onSubmit={envoyer} noValidate>
        <ChampPhoto etiquette="Photo (facultatif, mais elle attire l'œil)" valeur={photo} onChange={setPhoto} />
        <label htmlFor="texte">Ton texte</label>
        <textarea id="texte" name="texte" maxLength={500} placeholder="Ex. Salle de bain refaite à Bimbo : carrelage, plomberie et peinture, livrée en 6 jours." />
        {erreur && <Erreur texte={erreur} />}
        <p style={{ marginTop: 16 }}><button className="btn plein bloc" type="submit" disabled={envoi}>{envoi ? "Publication…" : "Publier"}</button></p>
        <p className="mute petit" style={{ marginTop: 10 }}>10 publications par jour au plus. Pas de fausse information : <Link href="/cgu">voir les règles</Link>.</p>
      </form>
    </div></section></main>
  );
}
