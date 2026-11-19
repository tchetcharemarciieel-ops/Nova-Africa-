"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Poste, Chargement, Erreur } from "@/components/Blocs";
import { api, messageErreur, type Besoin } from "@/lib/api";

export default function Besoins() {
  const [liste, setListe] = useState<Besoin[] | null>(null);
  const [erreur, setErreur] = useState("");
  useEffect(() => { api.listNeeds(50).then(setListe).catch(e => { setListe([]); setErreur(messageErreur(e)); }); }, []);
  return (
    <main className="page">
      <section className="carte"><div className="in"><h1>Besoins</h1><p className="lead">Quelqu&apos;un cherche un professionnel : réponds-lui ici.</p><Link href="/besoins/nouveau" className="btn plein">J&apos;ai besoin de…</Link></div></section>
      {erreur && <Erreur texte={erreur} />}
      {liste === null ? <Chargement /> : liste.length === 0 && !erreur ? <p className="vide">Aucun besoin pour l&apos;instant.</p>
        : liste.map(b => <Poste key={b.id} nom={b.nom} soustitre={`${b.metier} · ${b.lieu}`} temps={b.cree_le} titre={b.titre} texte={b.details} action="Répondre" href={`/messages/nouveau?to=${b.member_id}&nom=${encodeURIComponent(b.nom)}&sujet=${encodeURIComponent(`Je réponds à ton besoin : ${b.titre}`)}`} />)}
    </main>
  );
}
