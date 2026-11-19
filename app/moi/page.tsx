"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Avatar from "@/components/Avatar";
import { Chargement } from "@/components/Blocs";
import { api, type Me, type Profil } from "@/lib/api";
import { moi } from "@/lib/session";

function Contenu() {
  const bienvenue = useSearchParams().get("bienvenue") === "1";
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [carte, setCarte] = useState<Profil | null>(null);
  useEffect(() => {
    moi().then(async m => { setMe(m); if (m?.slug) setCarte(await api.getProfile(m.slug).catch(() => null)); }).catch(() => setMe(null));
  }, []);

  if (me === undefined) return <main className="page"><Chargement /></main>;
  if (me === null) return (
    <main className="page"><section className="carte"><div className="in">
      <h1>Mon profil</h1><p className="lead">Tu n&apos;es pas connecté(e) sur ce téléphone.</p>
      <div className="lignes"><Link className="btn plein" href="/inscription">Créer mon compte</Link><Link className="btn" href="/connexion">Se connecter</Link></div>
    </div></section></main>
  );
  return (
    <main className="page">
      {bienvenue && <p className="info" style={{ margin: "8px 12px" }}><b>Compte créé.</b> Va dans <Link href="/parametres">Paramètres</Link> pour noter ton code de connexion : il te permet de retrouver ton compte si tu changes de téléphone.</p>}
      <section className="carte"><div className="in" style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <Avatar nom={me.nom} taille={72} />
        <div><h1 style={{ margin: 0, fontSize: 22 }}>{me.nom}</h1><p className="mute petit">Compte sur ce téléphone</p></div>
      </div></section>

      <section className="carte"><div className="in">
        <h2>Ma carte pro</h2>
        {carte ? <>
          <p><b>{carte.metier}</b> · {carte.lieu}</p>
          <p className="mute petit">{carte.chantiers} chantier{carte.chantiers > 1 ? "s" : ""} confirmé{carte.chantiers > 1 ? "s" : ""} · Niveau {carte.niveau}/4</p>
          <div className="lignes" style={{ marginTop: 10 }}><Link className="btn plein" href={`/p/${carte.slug}`}>Voir ma carte</Link><Link className="btn" href="/moi/carte">Modifier</Link></div>
        </> : <>
          <p className="mute" style={{ marginBottom: 10 }}>Montre ton travail et fais-le confirmer par tes clients.</p>
          <Link className="btn plein" href="/creer">Créer ma carte pro</Link>
        </>}
      </div></section>

      <section className="carte">
        <Link className="ligne" href="/messages"><span className="corps"><span><b>Mes messages</b><small>Conversations avec les professionnels et les clients</small></span></span></Link>
        <Link className="ligne" href="/publier"><span className="corps"><span><b>Publier</b><small>Un besoin, une offre d&apos;emploi</small></span></span></Link>
        <Link className="ligne" href="/parametres"><span className="corps"><span><b>Paramètres</b><small>Mon code de connexion, quitter ce téléphone</small></span></span></Link>
        <Link className="ligne" href="/a-propos"><span className="corps"><span><b>À propos et confidentialité</b><small>Version de test</small></span></span></Link>
      </section>
    </main>
  );
}
export default function Moi() { return <Suspense fallback={<main className="page"><Chargement /></main>}><Contenu /></Suspense>; }
