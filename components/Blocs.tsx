import Link from "next/link";
import Avatar from "./Avatar";
import { depuis } from "@/lib/constants";
import type { Resume } from "@/lib/api";

export function ProLigne({ p, mess = true }: { p: Resume; mess?: boolean }) {
  return (
    <div className="ligne">
      <Link href={`/p/${p.slug}`} className="corps">
        <Avatar nom={p.nom} taille={54} />
        <span style={{ minWidth: 0 }}>
          <b>{p.nom}</b>
          <small>{p.metier} · {p.lieu}</small>
          <small>{p.chantiers > 0 ? <><span className="etoiles">★</span> {p.chantiers} chantier{p.chantiers > 1 ? "s" : ""} confirmé{p.chantiers > 1 ? "s" : ""}</> : "Pas encore de chantier confirmé"} · Niveau {p.niveau}</small>
        </span>
      </Link>
    </div>
  );
}

export function Poste({ nom, soustitre, temps, titre, texte, action, href, etiquette, carre }: {
  nom: string; soustitre: string; temps: string; titre: string; texte?: string; action: string; href: string; etiquette?: string; carre?: boolean;
}) {
  return (
    <article className="carte">
      <div className="post-t">
        <Avatar nom={nom} taille={46} carre={carre} />
        <span style={{ minWidth: 0 }}><b>{nom}</b><small>{soustitre} · {depuis(temps)}</small></span>
      </div>
      <div className="post-c">
        <span className={`tag ${etiquette ? "" : "besoin"}`}>{etiquette ? `Offre · ${etiquette}` : "Besoin"}</span>
        <b className="titre">{titre}</b>
        {texte && <p>{texte}</p>}
      </div>
      <div className="lien-act"><Link href={href}>{action}</Link></div>
    </article>
  );
}

export function Chargement() { return <p className="mute petit" role="status" style={{ padding: 12 }}>Chargement…</p>; }
export function Erreur({ texte }: { texte: string }) { return <p className="err" role="alert" style={{ margin: "8px 0" }}>{texte}</p>; }
