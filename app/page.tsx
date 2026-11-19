"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import Icone from "@/components/Icone";
import { ProLigne, Poste, Chargement, Erreur, EtatVide } from "@/components/Blocs";
import { api, messageErreur, type Besoin, type Me, type Offre, type Resume } from "@/lib/api";
import { moi, secretExistant } from "@/lib/session";

type Filtre = "tout" | "besoins" | "offres";

export default function Accueil() {
  const [pros, setPros] = useState<Resume[] | null>(null);
  const [besoins, setBesoins] = useState<Besoin[] | null>(null);
  const [offres, setOffres] = useState<Offre[] | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [visiteur, setVisiteur] = useState(false);
  const [filtre, setFiltre] = useState<Filtre>("tout");
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    setVisiteur(!secretExistant());
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
      <section className="hero-carte">
        <h1>Kargora</h1>
        <p>Trouve quelqu&apos;un de confiance, en Centrafrique et partout</p>
        <div className="hero-btns">
          {visiteur ? <>
            <Link href="/inscription" className="btn-blanc">Créer mon compte</Link>
            <Link href="/connexion" className="btn-vitre">Se connecter</Link>
          </> : <>
            <Link href={me?.slug ? `/p/${me.slug}` : "/creer"} className="btn-blanc">{me?.slug ? "Voir ma carte" : "Créer ma carte pro"}</Link>
            <Link href="/publier" className="btn-vitre">Publier</Link>
          </>}
        </div>
      </section>

      <section className="carte">
        <div className="compose">
          <Avatar nom={me?.nom || "Moi"} taille={46} />
          <Link href="/besoins/nouveau" className="faux">Que cherches-tu aujourd&apos;hui ?</Link>
        </div>
        <div className="pilules">
          <Link href="/besoins/nouveau" className="pilule" style={{ background: "#FEF3F2", color: "#C4320A" }}><Icone nom="recherche" taille={18} />Un besoin</Link>
          <Link href="/emplois/nouveau" className="pilule" style={{ background: "#ECFDF3", color: "#067647" }}><Icone nom="emplois" taille={18} />Une offre</Link>
          <Link href="/creer" className="pilule" style={{ background: "#EEF4FF", color: "#1D4ED8" }}><Icone nom="carte" taille={18} />Ma carte</Link>
        </div>
      </section>
      {erreur && <Erreur texte={erreur} />}

      <div className="chips" role="group" aria-label="Filtrer le fil">
        {([["tout", "Tout"], ["besoins", "Besoins"], ["offres", "Offres"]] as const).map(([k, n]) =>
          <button key={k} type="button" className={`chip${filtre === k ? " on" : ""}`} aria-pressed={filtre === k} onClick={() => setFiltre(k)}>{n}</button>)}
      </div>

      {!charge ? <Chargement /> : fil.length === 0 ? (
        <EtatVide icone={filtre === "offres" ? "emplois" : "recherche"} titre={filtre === "tout" ? "Rien pour l'instant" : "Aucune annonce dans cette catégorie pour le moment"}
          texte={filtre === "tout" ? "Aucune annonce n'a encore été publiée. Sois le premier : les professionnels te répondent ici." : "Reviens un peu plus tard, ou publie la première."}
          href={filtre === "offres" ? "/emplois/nouveau" : "/besoins/nouveau"} action={filtre === "offres" ? "Publier la première offre" : "Publier le premier besoin"} />
      ) : fil.map(e => e.t === "b"
          ? <Poste key={e.x.id} nom={e.x.nom} soustitre={`${e.x.metier} · ${e.x.lieu}`} temps={e.d} titre={e.x.titre} texte={e.x.details} action="Répondre" href={`/messages/nouveau?to=${e.x.member_id}&nom=${encodeURIComponent(e.x.nom)}&sujet=${encodeURIComponent(`Je réponds à ton besoin : ${e.x.titre}`)}`} />
          : <Poste key={e.x.id} nom={e.x.organisation} carre soustitre={e.x.lieu} temps={e.d} titre={e.x.titre} texte={e.x.details} etiquette={e.x.type} action="Postuler" href={`/messages/nouveau?to=${e.x.member_id}&nom=${encodeURIComponent(e.x.organisation)}&sujet=${encodeURIComponent(`Je postule à l'offre : ${e.x.titre}`)}`} />)}

      <div className="sec-t">Professionnels</div>
      <section className="carte">
        {pros === null ? <Chargement /> : pros.length === 0 ? <p className="in mute" style={{ padding: 20 }}>Aucune carte pour l&apos;instant.</p>
          : pros.map(p => <ProLigne key={p.slug} p={p} />)}
        <div className="lien-act"><Link href="/chercher">Voir tous les professionnels</Link></div>
      </section>
      <section className="carte"><div className="in">
        <h2>Pourquoi se fier</h2>
        <ul className="liste-conf">
          <li><span className="badge-vert"><Icone nom="bouclier" taille={22} /></span><div><b>Des preuves</b><span className="t">Un chantier compte seulement quand le client le confirme avec un lien envoyé par le professionnel.</span></div></li>
          <li><span className="badge-vert"><Icone nom="niveaux" taille={22} /></span><div><b>Des niveaux clairs</b><span className="t">Profil créé, profil complet, puis identité vérifiée et entreprise déclarée quand ils seront disponibles.</span></div></li>
          <li><span className="badge-vert"><Icone nom="etoile" taille={22} /></span><div><b>Des avis honnêtes</b><span className="t">Publiés tels quels, retirés seulement s&apos;ils sont faux ou injurieux, avec une explication.</span></div></li>
        </ul>
      </div></section>
      <p className="mute petit" style={{ padding: "0 4px" }}><Link href="/a-propos">À propos de Kargora et confidentialité</Link></p>
    </main>
  );
}
