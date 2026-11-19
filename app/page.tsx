"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import { ProLigne, Poste, Chargement, Erreur } from "@/components/Blocs";
import { api, messageErreur, type Besoin, type Me, type Offre, type Resume } from "@/lib/api";
import { moi, secretExistant } from "@/lib/session";

type Filtre = "tout" | "besoins" | "offres";

export default function Accueil() {
  const [pros, setPros] = useState<Resume[] | null>(null);
  const [besoins, setBesoins] = useState<Besoin[] | null>(null);
  const [offres, setOffres] = useState<Offre[] | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [filtre, setFiltre] = useState<Filtre>("tout");
  const [erreur, setErreur] = useState("");
  const [nouveau, setNouveau] = useState(false);

  useEffect(() => {
    setNouveau(!secretExistant());
    api.search("", "", 5).then(setPros).catch(e => { setPros([]); setErreur(messageErreur(e)); });
    api.listNeeds(20).then(setBesoins).catch(() => setBesoins([]));
    api.listJobs(20).then(setOffres).catch(() => setOffres([]));
    moi().then(setMe).catch(() => {});
  }, []);

  const fil = useMemo(() => {
    const b = filtre === "offres" ? [] : (besoins ?? []).map(x => ({ t: "b" as const, d: x.cree_le, x }));
    const o = filtre === "besoins" ? [] : (offres ?? []).map(x => ({ t: "o" as const, d: x.cree_le, x }));
    return [...b, ...o].sort((p, q) => (q.d > p.d ? 1 : -1));
  }, [besoins, offres, filtre]);
  const charge = besoins !== null && offres !== null;

  return (
    <main className="page">
      <section className="carte"><div className="marque-ligne"><b>Kargora</b><span>Trouve quelqu&apos;un de confiance, en Centrafrique et partout.</span></div></section>
      {nouveau && (
        <section className="carte"><div className="in">
          <h2>Bienvenue sur Kargora</h2>
          <p className="mute" style={{ marginBottom: 12 }}>Crée ton compte pour publier, répondre et recevoir des messages. Ça prend une minute, sans mot de passe.</p>
          <div className="lignes"><Link href="/inscription" className="btn plein">Créer mon compte</Link><Link href="/connexion" className="btn">Se connecter</Link></div>
        </div></section>
      )}
      <section className="carte">
        <div className="compose">
          <Avatar nom={me?.nom || "Moi"} taille={46} />
          <Link href="/besoins/nouveau" className="faux">Que cherches-tu aujourd&apos;hui ?</Link>
        </div>
        <div className="raccourcis">
          <Link href="/besoins/nouveau" style={{ color: "var(--besoin)" }}><span className="puce-pt" aria-hidden="true" />Un besoin</Link>
          <Link href="/emplois/nouveau" style={{ color: "var(--g)" }}><span className="puce-pt" aria-hidden="true" />Une offre</Link>
          <Link href="/creer" style={{ color: "#1f5f8b" }}><span className="puce-pt" aria-hidden="true" />Ma carte</Link>
        </div>
      </section>
      {erreur && <Erreur texte={erreur} />}

      <div className="chips" role="group" aria-label="Filtrer le fil">
        {([["tout", "Tout"], ["besoins", "Besoins"], ["offres", "Offres"]] as const).map(([k, n]) =>
          <button key={k} type="button" className={`chip${filtre === k ? " on" : ""}`} aria-pressed={filtre === k} onClick={() => setFiltre(k)}>{n}</button>)}
      </div>

      {!charge ? <Chargement /> : fil.length === 0 ? <p className="vide">Rien pour l&apos;instant. <Link href="/besoins/nouveau">Publie un besoin</Link> ou <Link href="/emplois/nouveau">une offre</Link>.</p>
        : fil.map(e => e.t === "b"
          ? <Poste key={e.x.id} nom={e.x.nom} soustitre={`${e.x.metier} · ${e.x.lieu}`} temps={e.d} titre={e.x.titre} texte={e.x.details} action="Répondre" href={`/messages/nouveau?to=${e.x.member_id}&nom=${encodeURIComponent(e.x.nom)}&sujet=${encodeURIComponent(`Je réponds à ton besoin : ${e.x.titre}`)}`} />
          : <Poste key={e.x.id} nom={e.x.organisation} carre soustitre={e.x.lieu} temps={e.d} titre={e.x.titre} texte={e.x.details} etiquette={e.x.type} action="Postuler" href={`/messages/nouveau?to=${e.x.member_id}&nom=${encodeURIComponent(e.x.organisation)}&sujet=${encodeURIComponent(`Je postule à l'offre : ${e.x.titre}`)}`} />)}

      <div className="sec-t" style={{ marginTop: 6 }}>Professionnels</div>
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
      <p className="mute petit" style={{ padding: "0 4px" }}><Link href="/a-propos">À propos de Kargora et confidentialité</Link></p>
    </main>
  );
}
