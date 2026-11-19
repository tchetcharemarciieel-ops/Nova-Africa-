"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import { Chargement, Erreur } from "@/components/Blocs";
import { NIVEAUX, depuis, formatPhone } from "@/lib/constants";
import { api, messageErreur, type Me, type Profil } from "@/lib/api";
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

  useEffect(() => {
    let vivant = true;
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
          <span className="anneau"><Avatar nom={p.nom} taille={92} /></span>
          <h1 className="nom" style={{ color: "var(--encre)", margin: "8px 0 0" }}>{p.nom}</h1>
          <p><span className="tag">{p.metier}</span></p>
          <p className="mute petit">{p.lieu} · {p.langues.join(", ") || "Français"}</p>
          {nouveau && <p className="info" style={{ marginTop: 10 }}>Ta carte est prête. Envoie-la à tes clients, et fais confirmer tes premiers chantiers.</p>}
          <div className="lignes" style={{ marginTop: 12 }}>
            {proprietaire ? <>
              <button className="btn plein" type="button" onClick={demander}>Demander une confirmation</button>
              <button className="btn" type="button" onClick={async () => { const r = await partager(`Ma carte pro : ${p.nom}, ${p.metier}`, url); setInfo(r === "copie" ? "Lien de ta carte copié." : r === "partage" ? "Carte partagée." : ""); }}>Partager ma carte</button>
            </> : <>
              <Link className="btn plein" href={`/messages/nouveau?to=${p.member_id}&nom=${encodeURIComponent(p.nom)}`}>Message</Link>
              {p.telephone && <a className="btn" href={`tel:+${p.telephone}`}>Appeler {formatPhone(p.telephone)}</a>}
            </>}
          </div>
          {info && <p className="info" role="status" style={{ marginTop: 10 }}>{info}</p>}
          {lienConf && <p className="petit" style={{ marginTop: 8, wordBreak: "break-all" }}>Lien à envoyer à ton client : <b>{lienConf}</b></p>}
          {erreur && <Erreur texte={erreur} />}
        </div>
        <div className="stats">
          <div className="st"><b>{p.chantiers}</b><span>chantiers confirmés</span></div>
          <div className="st"><b>{p.chantiers ? String(p.moyenne).replace(".", ",") : "–"}</b><span>note moyenne</span></div>
          <div className="st"><b>{p.niveau}/4</b><span>niveau</span></div>
        </div>
      </article>

      <section className="carte"><div className="in">
        <h2>Niveau de confiance <small>{NIVEAUX[p.niveau - 1].nom}</small></h2>
        <div className="niveaux" aria-hidden="true">{NIVEAUX.map(n => <i key={n.n} className={n.n <= p.niveau ? "on" : ""} />)}</div>
        <p className="mute petit">Niveaux 3 et 4 (identité vérifiée, entreprise déclarée) : bientôt. {proprietaire && p.niveau === 1 && "Pour passer au niveau 2, écris au moins 20 lettres dans « ce que tu sais faire »."}</p>
      </div></section>

      {p.apropos && <section className="carte"><div className="in"><h2>À propos</h2><p>{p.apropos}</p></div></section>}

      <section className="carte"><div className="in">
        <h2>Chantiers confirmés <small>{p.chantiers}</small></h2>
        {p.avis.length === 0 ? <p className="mute">Pas encore de chantier confirmé. Il apparaît quand un client confirme avec le lien envoyé par le professionnel.</p>
          : p.avis.map((a, i) => (
            <div key={i} style={{ padding: "10px 0", borderTop: i ? "1px solid var(--b)" : 0 }}>
              <b>{a.travail}</b> <span className="etoiles" aria-label={`${a.note} sur 5`}>{"★".repeat(a.note)}</span>
              {a.avis && <p>« {a.avis} »</p>}
              <p className="mute petit">{a.prenom || "Un client"} · chantier confirmé · {depuis(a.cree_le)}</p>
            </div>))}
      </div></section>

      {qr && <section className="carte"><div className="qr"><img src={qr} alt={`QR code de la carte de ${p.nom}`} /><span className="mute petit">Montre ce code, ou imprime-le pour ton atelier.</span></div></section>}
      <p className="mute petit" style={{ padding: "0 4px" }}><b>Notre règle sur les avis :</b> publiés tels quels, retirés seulement s&apos;ils sont faux ou injurieux, et nous disons pourquoi. Personne ne peut payer pour les faire disparaître.</p>
    </main>
  );
}
export default function Carte() { return <Suspense fallback={<main className="page"><Chargement /></main>}><Contenu /></Suspense>; }
