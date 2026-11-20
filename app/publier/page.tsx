"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LigneMenu from "@/components/LigneMenu";
import type { Me } from "@/lib/api";
import { moi } from "@/lib/session";

export default function Publier() {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  useEffect(() => { moi().then(setMe).catch(() => setMe(null)); }, []);
  const entreprise = !!me?.org_slug;
  if (me === null) return (
    <main className="page">
      <section className="carte"><div className="in">
        <h1>Publier</h1>
        <p className="lead">Pour publier une réalisation, un besoin ou une offre, crée d&apos;abord ton compte. Sans mot de passe, en deux minutes.</p>
        <div className="lignes">
          <Link className="btn plein" href="/inscription-candidat">Je suis un Professionnel / Candidat</Link>
          <Link className="btn" href="/inscription-entreprise">Je suis une Entreprise / ONG</Link>
        </div>
        <p className="lien-bas">Déjà un compte ? <Link href="/connexion">Se connecter</Link></p>
      </div></section>
    </main>
  );
  return (
    <main className="page">
      <section className="carte"><div className="in"><h1>Publier</h1><p className="lead" style={{ marginBottom: 0 }}>Que veux-tu faire ?</p></div></section>
      <section className="carte menu">
        <LigneMenu href="/publier/realisation" icone="photo" teinte="bleu" titre="Partager une réalisation / actualité" sous="Un texte et une photo de ton travail, visibles sur le fil d'accueil." />
        <LigneMenu href="/besoins/nouveau" icone="recherche" teinte="rose" titre="J'ai besoin de…" sous="Un plombier, une couturière, un mécanicien : les professionnels te répondent ici." />
        {entreprise
          ? <LigneMenu href="/emplois/nouveau" icone="emplois" teinte="vert" titre="Publier une offre d'emploi" sous="Emploi, stage ou mission : les candidats t'écrivent ici." />
          : <LigneMenu href="/inscription-entreprise" icone="batiment" teinte="vert" titre="Publier une offre d'emploi" sous="Réservé aux entreprises et ONG : crée d'abord ta page entreprise." />}
        {!me?.slug && !entreprise && <LigneMenu href="/inscription-candidat" icone="carte" teinte="ambre" titre="Créer ma carte pro" sous="Montre ton travail et fais-le confirmer par tes clients." />}
      </section>
      <p className="mute petit" style={{ padding: "0 4px" }}>Voir : <Link href="/besoins">tous les besoins</Link> · <Link href="/emplois">toutes les offres</Link></p>
    </main>
  );
}
