"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import Icone from "@/components/Icone";
import ChampPhoto from "@/components/ChampPhoto";
import { Chargement, Erreur, Verifiee } from "@/components/Blocs";
import { depuis } from "@/lib/constants";
import { api, messageErreur, type Me, type Org } from "@/lib/api";
import type { Image } from "@/lib/image";
import { getSecret, moi } from "@/lib/session";

export default function PageEntreprise() {
  const { slug } = useParams<{ slug: string }>();
  const [o, setO] = useState<Org | null | undefined>(undefined);
  const [me, setMe] = useState<Me | null>(null);
  const [erreur, setErreur] = useState("");
  const [logo, setLogo] = useState<Image | null>(null);
  const [modifLogo, setModifLogo] = useState(false);

  function charger() { api.orgGet(String(slug)).then(setO).catch(e => { setO(null); setErreur(messageErreur(e)); }); }
  useEffect(() => { charger(); moi().then(setMe).catch(() => {}); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [slug]);

  if (o === undefined) return <main className="page"><Chargement /></main>;
  if (o === null) return <main className="page"><section className="carte"><div className="in"><h1>Page introuvable</h1>{erreur ? <Erreur texte={erreur} /> : <p className="lead">Cette entreprise n&apos;existe pas ou n&apos;est plus visible.</p>}<Link className="btn plein" href="/emplois">Voir les offres</Link></div></section></main>;

  const proprio = me?.org_slug === o.slug;
  const verifiee = o.statut === "verifiee";
  async function enregistrerLogo() {
    setErreur("");
    try { await api.setPhoto(getSecret(), logo?.data ?? null, logo?.thumb ?? null); setModifLogo(false); setLogo(null); charger(); }
    catch (e) { setErreur(messageErreur(e)); }
  }
  return (
    <main className="page">
      <article className="carte">
        <div className="bandeau" aria-hidden="true" />
        <div className="profil-tete">
          <span className="anneau" style={{ borderRadius: 22 }}><Avatar nom={o.nom} photo={o.logo} carre taille={88} /></span>
          <h1 className="nom">{o.nom}</h1>
          <p>{o.secteur}</p>
          <p className="mute petit">{o.lieu}{o.adresse ? ` · ${o.adresse}` : ""}</p>
          <p style={{ marginTop: 10 }}>{verifiee ? <Verifiee /> : <Verifiee attente />}</p>
          {verifiee && <p className="petit" style={{ marginTop: 6, color: "#4338CA" }}><b>Entreprise vérifiée</b> : RCCM et NIF contrôlés par l&apos;équipe Kargora.</p>}
          {!verifiee && <p className="mute petit" style={{ marginTop: 6 }}>Les documents de cette entreprise n&apos;ont pas encore été contrôlés. {proprio ? "Nous te contactons sur le WhatsApp du responsable RH." : "Sois prudent : une vraie offre ne demande jamais d'argent."}</p>}
          <div className="lignes" style={{ marginTop: 12 }}>
            {proprio ? <>
              <Link className="btn plein" href="/emplois/nouveau">Publier une offre</Link>
              <button type="button" className="btn" onClick={() => setModifLogo(v => !v)}>Changer le logo</button>
            </> : <Link className="btn plein" href={`/messages/nouveau?to=${o.member_id}&nom=${encodeURIComponent(o.nom)}`}>Écrire à l&apos;entreprise</Link>}
          </div>
          {modifLogo && <div><ChampPhoto avatar carre etiquette="Nouveau logo" nom={o.nom} valeur={logo} onChange={setLogo} /><p style={{ marginTop: 10 }}><button type="button" className="btn plein petit" onClick={enregistrerLogo}>Enregistrer le logo</button></p></div>}
          {erreur && <Erreur texte={erreur} />}
        </div>
      </article>
      {o.apropos && <section className="carte"><div className="in"><h2>Présentation</h2><p>{o.apropos}</p></div></section>}
      <section className="carte"><div className="in">
        <h2>Offres d&apos;emploi actives <small>{o.offres.length}</small></h2>
        {o.offres.length === 0 ? <p className="mute">Aucune offre active pour le moment.</p> : o.offres.map(j => (
          <div key={j.id} className="chantier">
            <span className="coche" aria-hidden="true"><Icone nom="emplois" taille={20} /></span>
            <div style={{ minWidth: 0 }}><b>{j.titre}</b> <span className="tag">{j.type}</span>
              <p className="mute petit">{j.lieu} · {depuis(j.cree_le)}</p>{j.details && <p>{j.details}</p>}
              {!proprio && <p style={{ marginTop: 8 }}><Link className="btn petit plein" href={`/messages/nouveau?to=${o.member_id}&nom=${encodeURIComponent(o.nom)}&sujet=${encodeURIComponent(`Je postule à l'offre : ${j.titre}`)}`}>Postuler</Link></p>}
            </div>
          </div>))}
      </div></section>
    </main>
  );
}
