"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Poste, Chargement, Erreur, EtatVide } from "@/components/Blocs";
import { api, messageErreur, type Offre } from "@/lib/api";

export default function Emplois() {
  const [liste, setListe] = useState<Offre[] | null>(null);
  const [erreur, setErreur] = useState("");
  useEffect(() => { api.listJobs(50).then(setListe).catch(e => { setListe([]); setErreur(messageErreur(e)); }); }, []);
  return (
    <main className="page">
      <section className="carte"><div className="in"><h1>Offres d&apos;emploi</h1><p className="lead">Emplois, stages et missions. Postule par message dans l&apos;application.</p><Link href="/emplois/nouveau" className="btn plein">Publier une offre</Link>
        <p className="info" style={{ marginTop: 12 }}>Aucune offre n&apos;est vérifiée pour l&apos;instant. Méfie-toi de toute offre qui demande de l&apos;argent.</p></div></section>
      {erreur && <Erreur texte={erreur} />}
      {liste === null ? <Chargement /> : liste.length === 0 && !erreur ? <EtatVide icone="emplois" titre="Aucune offre pour l'instant" texte="Publie la première offre d'emploi, de stage ou de mission : les candidats t'écrivent ici." href="/emplois/nouveau" action="Publier la première offre" />
        : liste.map(o => <Poste key={o.id} carre nom={o.organisation} soustitre={o.lieu} temps={o.cree_le} titre={o.titre} texte={o.details} etiquette={o.type} action="Postuler" href={`/messages/nouveau?to=${o.member_id}&nom=${encodeURIComponent(o.organisation)}&sujet=${encodeURIComponent(`Je postule à l'offre : ${o.titre}`)}`} />)}
    </main>
  );
}
