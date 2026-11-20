"use client";

import Link from "next/link";
import Icone, { type NomIcone } from "./Icone";
import Avatar from "./Avatar";
import { depuis } from "@/lib/constants";
import type { Resume } from "@/lib/api";

export function ProLigne({ p, mess = true }: { p: Resume; mess?: boolean }) {
  return (
    <div className="ligne">
      <Link href={`/p/${p.slug}`} className="corps">
        <Avatar nom={p.nom} photo={p.photo} taille={54} />
        <span style={{ minWidth: 0 }}>
          <b>{p.nom}</b>
          <small>{p.metier} · {p.lieu}</small>
          <small>{p.chantiers > 0 ? <><span className="etoiles">★</span> {p.chantiers} chantier{p.chantiers > 1 ? "s" : ""} confirmé{p.chantiers > 1 ? "s" : ""}</> : "Pas encore de chantier confirmé"} · Niveau {p.niveau}</small>
        </span>
      </Link>
    </div>
  );
}

export function Verifiee({ attente = false }: { attente?: boolean }) {
  return <span className={`verif${attente ? " att" : ""}`}><Icone nom={attente ? "info" : "bouclier"} taille={14} trait={2} />{attente ? "En attente de vérification" : "Entreprise vérifiée"}</span>;
}

export function Poste({ nom, photo, soustitre, temps, genre, titre, texte, action, href, etiquette, carre, verifiee, hrefNom, image }: {
  nom: string; photo?: string | null; soustitre: string; temps: string; genre: "besoin" | "offre" | "realisation"; titre?: string; texte?: string;
  action: string; href: string; etiquette?: string; carre?: boolean; verifiee?: boolean; hrefNom?: string; image?: { thumb: string; legende: string; ouvrir: () => void };
}) {
  const tete = <><Avatar nom={nom} photo={photo} taille={46} carre={carre} /><span style={{ minWidth: 0 }}><b>{nom}</b><small>{soustitre} · {depuis(temps)}</small></span></>;
  return (
    <article className="carte">
      {hrefNom ? <Link href={hrefNom} className="post-t" style={{ color: "inherit" }}>{tete}</Link> : <div className="post-t">{tete}</div>}
      <div className="post-c">
        <span className="tag-ligne">
          <span className={`tag ${genre === "besoin" ? "besoin" : ""}`}>{genre === "offre" ? `Offre · ${etiquette}` : genre === "besoin" ? "Besoin" : "Réalisation"}</span>
          {verifiee && <Verifiee />}
        </span>
        {titre && <b className="titre">{titre}</b>}
        {texte && <p style={{ color: genre === "realisation" ? "var(--txt)" : undefined, marginTop: genre === "realisation" ? 8 : 2 }}>{texte}</p>}
      </div>
      {image && <button type="button" className="post-img" onClick={image.ouvrir} aria-label={`Voir l'image en grand : ${image.legende}`}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={image.thumb} alt={image.legende} loading="lazy" /></button>}
      <div className="lien-act"><Link href={href}>{action}</Link></div>
    </article>
  );
}

export function Chargement() { return <p className="mute petit" role="status" style={{ padding: 12 }}>Chargement…</p>; }
export function Erreur({ texte }: { texte: string }) { return <p className="err" role="alert" style={{ margin: "8px 0" }}>{texte}</p>; }

export function EtatVide({ icone, titre, texte, href, action }: { icone: NomIcone; titre: string; texte: string; href?: string; action?: string }) {
  return (
    <section className="vide-carte">
      <span className="vide-ico"><Icone nom={icone} taille={30} trait={1.5} /></span>
      <h2>{titre}</h2>
      <p>{texte}</p>
      {href && action && <Link href={href} className="btn plein">{action}</Link>}
    </section>
  );
}
