"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProLigne, Poste, Chargement, Erreur } from "@/components/Blocs";
import { api, messageErreur, type Besoin, type Offre, type Resume } from "@/lib/api";

export default function Accueil() {
  const [pros, setPros] = useState<Resume[] | null>(null);
  const [besoins, setBesoins] = useState<Besoin[] | null>(null);
  const [offres, setOffres] = useState<Offre[] | null>(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    api.search("", "", 5).then(setPros).catch(e => { setPros([]); setErreur(messageErreur(e)); });
    api.listNeeds(4).then(setBesoins).catch(() => setBesoins([]));
    api.listJobs(3).then(setOffres).catch(() => setOffres([]));
  }, []);

  return (
    <main className="page">
      <section className="hero">
        <span className="kicker">Réseau pro · Centrafrique</span>
        <h1>Trouve quelqu&apos;un de <em>confiance</em>.</h1>
        <p className="lead">Des professionnels dont les clients ont confirmé le travail. Tu leur écris directement ici.</p>
        <div className="lignes">
          <Link href="/creer" className="btn or">Créer ma carte pro</Link>
          <Link href="/besoins/nouveau" className="btn clair">J&apos;ai besoin de…</Link>
        </div>
      </section>
      <div className="titre-sec" style={{ marginTop: 4 }}>Que cherches-tu ?</div>
      <div className="defile">
        {[["Plomberie", "#1f6f8b"], ["Électricité", "#d4a017"], ["Couture et mode", "#c4511f"], ["Mécanique auto", "#4c5a53"], ["Coiffure et beauté", "#8e3b6e"], ["Menuiserie", "#7a3a12"], ["Informatique", "#1e8e5a"], ["Cuisine et traiteur", "#c4511f"]].map(([m, c]) =>
          <Link key={m} className="puce" href={`/chercher?m=${encodeURIComponent(m)}`} style={{ ["--c" as string]: c }}><i aria-hidden="true" />{m}</Link>)}
      </div>
      {erreur && <Erreur texte={erreur} />}

      <div className="titre-sec">Besoins récents</div>
      {besoins === null ? <Chargement /> : besoins.length === 0 ? <p className="vide">Aucun besoin publié. <Link href="/besoins/nouveau">Publie le tien</Link>.</p>
        : besoins.map(b => <Poste key={b.id} nom={b.nom} soustitre={`${b.metier} · ${b.lieu}`} temps={b.cree_le} titre={b.titre} texte={b.details} action="Répondre" href={`/messages/nouveau?to=${b.member_id}&nom=${encodeURIComponent(b.nom)}&sujet=${encodeURIComponent(`Je réponds à ton besoin : ${b.titre}`)}`} />)}

      {offres && offres.length > 0 && <>
        <div className="titre-sec">Offres d&apos;emploi</div>
        {offres.map(o => <Poste key={o.id} nom={o.organisation} soustitre={`${o.lieu}`} temps={o.cree_le} titre={o.titre} texte={o.details} etiquette={o.type} action="Postuler" href={`/messages/nouveau?to=${o.member_id}&nom=${encodeURIComponent(o.organisation)}&sujet=${encodeURIComponent(`Je postule à l'offre : ${o.titre}`)}`} />)}
      </>}

      <div className="titre-sec">Professionnels</div>
      <section className="carte">
        {pros === null ? <Chargement /> : pros.length === 0 ? <p className="in mute">Aucune carte pour l&apos;instant. <Link href="/creer">Crée la première.</Link></p>
          : pros.map(p => <ProLigne key={p.slug} p={p} />)}
        <div className="lien-act"><Link href="/chercher">Voir tous les professionnels</Link></div>
      </section>

      <section className="carte"><div className="in">
        <h2>Pourquoi se fier</h2>
        <p><b>Des preuves.</b> Un chantier compte seulement quand le client le confirme avec un lien envoyé par le professionnel.</p>
        <p style={{ marginTop: 8 }}><b>Des niveaux clairs.</b> Profil créé, profil complet, puis identité vérifiée et entreprise déclarée quand ils seront disponibles.</p>
        <p style={{ marginTop: 8 }}><b>Des avis honnêtes.</b> Publiés tels quels, retirés seulement s&apos;ils sont faux ou injurieux, avec une explication.</p>
      </div></section>
    </main>
  );
}
