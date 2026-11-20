"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import Icone from "@/components/Icone";
import { Chargement, Erreur } from "@/components/Blocs";
import ChampPhoto from "@/components/ChampPhoto";
import Lightbox from "@/components/Lightbox";
import { NIVEAUX, depuis, formatPhone } from "@/lib/constants";
import { api, messageErreur, type Me, type Parcours, type Profil, type Realisation } from "@/lib/api";
import type { Image } from "@/lib/image";
import { getSecret, moi } from "@/lib/session";

async function partager(titre: string, url: string): Promise<"partage" | "copie" | "echec"> {
  try {
    if (typeof navigator.share === "function") { await navigator.share({ title: titre, text: titre, url }); return "partage"; }
    await navigator.clipboard.writeText(url); return "copie";
  } catch { return "echec"; }
}

function Contenu() {
  const { slug } = useParams<{ slug: string }>();
  const nouveau = useSearchParams().get("nouveau") === "1";
  const [p, setP] = useState<Profil | null | undefined>(undefined);
  const [me, setMe] = useState<Me | null>(null);
  const [qr, setQr] = useState("");
  const [lienConf, setLienConf] = useState("");
  const [info, setInfo] = useState("");
  const [erreur, setErreur] = useState("");
  const [galerie, setGalerie] = useState<Realisation[]>([]);
  const [ouverte, setOuverte] = useState<Realisation | null>(null);
  const [ajout, setAjout] = useState(false);
  const [img, setImg] = useState<Image | null>(null);
  const [legende, setLegende] = useState("");
  const [photoProfil, setPhotoProfil] = useState(false);
  const [nouvPhoto, setNouvPhoto] = useState<Image | null>(null);
  const [parc, setParc] = useState<"experience" | "formation" | null>(null);

  function recharger() {
    api.getProfile(String(slug)).then(setP).catch(() => {});
    api.photos(String(slug)).then(setGalerie).catch(() => {});
  }
  async function ajouterPhoto() {
    if (!img) return setErreur("Choisis d'abord une image.");
    setErreur("");
    try { await api.addPhoto(getSecret(), img.data, img.thumb, legende.trim().slice(0, 80)); setImg(null); setLegende(""); setAjout(false); recharger(); }
    catch (e) { setErreur(messageErreur(e)); }
  }
  async function retirerPhoto(id: string) { try { await api.deletePhoto(getSecret(), id); recharger(); } catch (e) { setErreur(messageErreur(e)); } }
  async function enregistrerPhotoProfil() {
    setErreur("");
    try { await api.setPhoto(getSecret(), nouvPhoto?.data ?? null, nouvPhoto?.thumb ?? null); setPhotoProfil(false); setNouvPhoto(null); recharger(); }
    catch (e) { setErreur(messageErreur(e)); }
  }
  async function ajouterParcours(e: React.FormEvent<HTMLFormElement>, genre: "experience" | "formation") {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const titre = String(f.get("titre") || "").trim();
    if (titre.length < 2) return setErreur("Écris l'intitulé (2 lettres au moins).");
    setErreur("");
    try { await api.addParcours(getSecret(), genre, titre, String(f.get("organisme") || "").trim(), String(f.get("periode") || "").trim()); setParc(null); recharger(); }
    catch (er) { setErreur(messageErreur(er)); }
  }
  async function retirerParcours(id: string) { try { await api.deleteParcours(getSecret(), id); recharger(); } catch (e) { setErreur(messageErreur(e)); } }

  useEffect(() => {
    let vivant = true;
    api.photos(String(slug)).then(g => { if (vivant) setGalerie(g); }).catch(() => {});
    api.getProfile(String(slug)).then(r => { if (vivant) setP(r); }).catch(e => { if (vivant) { setP(null); setErreur(messageErreur(e)); } });
    moi().then(m => { if (vivant) setMe(m); }).catch(() => {});
    const url = `${location.origin}/p/${slug}`;
    import("qrcode").then(q => q.toDataURL(url, { margin: 1, width: 300 })).then(s => { if (vivant) setQr(s); }).catch(() => {});
    return () => { vivant = false; };
  }, [slug]);

  if (p === undefined) return <main className="page"><Chargement /></main>;
  if (p === null) return <main className="page"><section className="carte"><div className="in"><h1>Carte introuvable</h1>{erreur ? <Erreur texte={erreur} /> : <p className="lead">Cette carte n&apos;existe pas ou a été retirée.</p>}<Link className="btn plein" href="/chercher">Voir le réseau</Link></div></section></main>;

  const proprietaire = me?.slug === p.slug;
  const url = typeof location !== "undefined" ? `${location.origin}/p/${p.slug}` : "";

  async function demander() {
    setErreur(""); setInfo("");
    try {
      const code = await api.createInvite(getSecret());
      const lien = `${location.origin}/confirmer/${code}`;
      setLienConf(lien);
      const r = await partager("Confirme mon travail sur Réseau pro", lien);
      setInfo(r === "copie" ? "Lien copié. Envoie-le à ton client." : r === "partage" ? "Lien partagé." : "Copie le lien ci-dessous et envoie-le à ton client.");
    } catch (e) { setErreur(messageErreur(e)); }
  }

  return (
    <main className="page">
      <article className="carte">
        <div className="bandeau" aria-hidden="true" />
        <div className="profil-tete">
          <span className="anneau"><Avatar nom={p.nom} photo={p.photo} taille={88} /></span>
          <h1 className="nom">{p.nom}</h1>
          <p>{p.metier}</p>
          <p className="mute petit">{p.lieu} · {p.langues.join(", ") || "Français"}</p>
          <p className="petit" style={{ marginTop: 6 }}><b style={{ color: "var(--g)" }}>{p.chantiers} chantier{p.chantiers > 1 ? "s" : ""} confirmé{p.chantiers > 1 ? "s" : ""}</b>{p.chantiers > 0 && <> · <span className="etoiles">★</span> {String(p.moyenne).replace(".", ",")}</>} · Niveau {p.niveau}/4</p>
          {nouveau && <p className="info" style={{ marginTop: 10 }}>Ta carte est prête. Envoie-la à tes clients, et fais confirmer tes premiers chantiers.</p>}
          <div className="lignes" style={{ marginTop: 12 }}>
            {proprietaire ? <>
              <button className="btn plein" type="button" onClick={demander}>Demander une confirmation</button>
              <button className="btn" type="button" onClick={() => setPhotoProfil(v => !v)}>Changer ma photo</button>
              <button className="btn" type="button" onClick={async () => { const r = await partager(`Ma carte pro : ${p.nom}, ${p.metier}`, url); setInfo(r === "copie" ? "Lien de ta carte copié." : r === "partage" ? "Carte partagée." : ""); }}>Partager ma carte</button>
            </> : <>
              <Link className="btn plein" href={`/messages/nouveau?to=${p.member_id}&nom=${encodeURIComponent(p.nom)}`}>Message</Link>
              {p.telephone && <a className="btn-wa" href={`https://wa.me/${p.telephone}?text=${encodeURIComponent(`Bonjour ${p.nom}, je t'ai trouvé sur Kargora.`)}`} target="_blank" rel="noopener noreferrer"><Icone nom="whatsapp" taille={18} />WhatsApp</a>}
              {p.telephone && <a className="btn" href={`tel:+${p.telephone}`}>Appeler {formatPhone(p.telephone)}</a>}
            </>}
          </div>
          {photoProfil && proprietaire && <div><ChampPhoto avatar etiquette="Nouvelle photo de profil" nom={p.nom} valeur={nouvPhoto} onChange={setNouvPhoto} aide="Laisse vide puis enregistre pour retirer ta photo." /><p style={{ marginTop: 10 }}><button type="button" className="btn plein petit" onClick={enregistrerPhotoProfil}>Enregistrer</button></p></div>}
          {info && <p className="info" role="status" style={{ marginTop: 10 }}>{info}</p>}
          {lienConf && <p className="petit" style={{ marginTop: 8, wordBreak: "break-all" }}>Lien à envoyer à ton client : <b>{lienConf}</b></p>}
          {erreur && <Erreur texte={erreur} />}
        </div>
      </article>

      <section className="carte"><div className="in">
        <h2>Niveau de confiance</h2>
        <ul className="etapes">{NIVEAUX.map(n => <li key={n.n} className={n.n <= p.niveau ? "ok" : ""}><i aria-hidden="true">{n.n <= p.niveau ? "✓" : ""}</i><span>{n.nom}{n.n > 2 && <> <span className="tag a">bientôt</span></>}</span></li>)}</ul>
        {proprietaire && p.niveau === 1 && <p className="mute petit">Pour passer au niveau 2, écris au moins 20 lettres dans « ce que tu sais faire ».</p>}
      </div></section>

      {p.apropos && <section className="carte"><div className="in"><h2>À propos</h2><p>{p.apropos}</p></div></section>}

      <section className="carte"><div className="in">
        <h2>Parcours</h2>
        {(p.parcours ?? []).length === 0 && !proprietaire && <p className="mute">Aucune expérience ni formation indiquée.</p>}
        <ul className="parcours-l">
          {(["experience", "formation"] as const).flatMap(g => (p.parcours ?? []).filter((x: Parcours) => x.genre === g).map((x: Parcours) => (
            <li key={x.id}><span className="ico"><Icone nom={g === "experience" ? "emplois" : "etoile"} taille={20} /></span>
              <div style={{ minWidth: 0 }}><b>{x.titre}</b><p className="mute petit">{g === "experience" ? "Expérience" : "Formation / diplôme"}{x.organisme ? ` · ${x.organisme}` : ""}{x.periode ? ` · ${x.periode}` : ""}</p></div>
              {proprietaire && <button type="button" className="x" aria-label={`Supprimer ${x.titre}`} onClick={() => retirerParcours(x.id)}><Icone nom="corbeille" taille={20} /></button>}</li>)))}
        </ul>
        {proprietaire && (parc ? (
          <form onSubmit={e => ajouterParcours(e, parc)} noValidate>
            <label htmlFor="pt">{parc === "experience" ? "Poste occupé" : "Diplôme ou formation"}</label><input id="pt" name="titre" maxLength={80} />
            <label htmlFor="po">{parc === "experience" ? "Entreprise" : "École ou organisme"} (facultatif)</label><input id="po" name="organisme" maxLength={80} />
            <label htmlFor="pp">Période (facultatif)</label><input id="pp" name="periode" maxLength={30} placeholder="Ex. 2021 – 2024" />
            <div className="lignes" style={{ marginTop: 14 }}><button className="btn plein petit" type="submit">Ajouter</button><button className="btn petit" type="button" onClick={() => setParc(null)}>Annuler</button></div>
          </form>
        ) : <div className="lignes" style={{ marginTop: 8 }}><button type="button" className="btn petit" onClick={() => setParc("experience")}>+ Expérience</button><button type="button" className="btn petit" onClick={() => setParc("formation")}>+ Formation / diplôme</button></div>)}
      </div></section>

      <section className="carte"><div className="in">
        <h2>Mes réalisations &amp; formations <small>{galerie.length}</small></h2>
        {galerie.length === 0 ? <p className="mute">{proprietaire ? "Montre ton travail : ajoute des photos de tes chantiers, diplômes ou attestations, avec une légende." : "Aucune photo pour le moment."}</p> : (
          <div className="galerie">
            {galerie.map(g => (
              <figure key={g.id} className="vignette">
                <button type="button" className="ouvrir" onClick={() => setOuverte(g)} aria-label={`Voir en grand : ${g.legende || "réalisation"}`}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={g.thumb} alt={g.legende || "Réalisation"} loading="lazy" /></button>
                <figcaption><p>{g.legende}</p></figcaption>
                {proprietaire && <button type="button" className="suppr" aria-label="Supprimer cette photo" onClick={() => retirerPhoto(g.id)}><Icone nom="corbeille" taille={18} /></button>}
              </figure>))}
          </div>)}
        {proprietaire && (ajout ? (
          <div><ChampPhoto etiquette="Photo du chantier, diplôme ou attestation" valeur={img} onChange={setImg} />
            <label htmlFor="leg">Légende</label><input id="leg" maxLength={80} value={legende} onChange={e => setLegende(e.target.value)} placeholder="Ex. Salle de bain refaite à Bimbo, 2025" />
            <div className="lignes" style={{ marginTop: 14 }}><button type="button" className="btn plein petit" onClick={ajouterPhoto}>Ajouter à ma galerie</button><button type="button" className="btn petit" onClick={() => { setAjout(false); setImg(null); }}>Annuler</button></div>
          </div>
        ) : <p style={{ marginTop: 14 }}><button type="button" className="btn plein" onClick={() => setAjout(true)}><Icone nom="photo" taille={18} />Ajouter une photo</button></p>)}
      </div></section>

      <section className="carte"><div className="in">
        <h2>Chantiers confirmés <small>{p.chantiers}</small></h2>
        {p.avis.length === 0 ? <p className="mute">Pas encore de chantier confirmé. Il apparaît quand un client confirme avec le lien envoyé par le professionnel.</p>
          : p.avis.map((a, i) => (
            <div key={i} className="chantier">
              <span className="coche" aria-hidden="true">✓</span>
              <div><b>{a.travail}</b> <span className="etoiles" aria-label={`${a.note} sur 5`}>{"★".repeat(a.note)}</span>
                {a.avis && <p>« {a.avis} »</p>}
                <p className="mute petit">{a.prenom || "Un client"} · chantier confirmé · {depuis(a.cree_le)}</p></div>
            </div>))}
      </div></section>

      {ouverte && <Lightbox apercu={ouverte.thumb} legende={ouverte.legende} charger={() => api.photoFull(ouverte.id)} onClose={() => setOuverte(null)} />}
      {qr && <section className="carte"><div className="qr"><img src={qr} alt={`QR code de la carte de ${p.nom}`} /><span className="mute petit">Montre ce code, ou imprime-le pour ton atelier.</span></div></section>}
      <p className="mute petit" style={{ padding: "0 4px" }}><b>Notre règle sur les avis :</b> publiés tels quels, retirés seulement s&apos;ils sont faux ou injurieux, et nous disons pourquoi. Personne ne peut payer pour les faire disparaître.</p>
    </main>
  );
}
export default function Carte() { return <Suspense fallback={<main className="page"><Chargement /></main>}><Contenu /></Suspense>; }
