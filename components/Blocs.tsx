import Link from "next/link";
import Avatar from "./Avatar";
import { depuis } from "@/lib/constants";
import type { Resume } from "@/lib/api";

export function ProLigne({ p }: { p: Resume }) {
  return (
    <Link href={`/p/${p.slug}`} className="ligne">
      <Avatar nom={p.nom} taille={52} />
      <span style={{ minWidth: 0 }}>
        <b>{p.nom}</b>
        <small>{p.metier} · {p.lieu}</small>
        <small>{p.chantiers > 0 ? `${p.chantiers} chantier${p.chantiers > 1 ? "s" : ""} confirmé${p.chantiers > 1 ? "s" : ""}` : "Pas encore de chantier confirmé"} · Niveau {p.niveau}</small>
      </span>
    </Link>
  );
}

export function Poste({ nom, soustitre, temps, titre, texte, action, href, etiquette }: {
  nom: string; soustitre: string; temps: string; titre: string; texte?: string; action: string; href: string; etiquette?: string;
}) {
  return (
    <article className="carte">
      <div className="post-t">
        <Avatar nom={nom} taille={46} />
        <span style={{ minWidth: 0 }}><b>{nom}</b><small className="mute petit" style={{ display: "block" }}>{soustitre} · {depuis(temps)}</small></span>
      </div>
      <div className="post-c">
        {etiquette && <span className="tag a" style={{ marginBottom: 6 }}>{etiquette}</span>}
        <p><b>{titre}</b></p>
        {texte && <p className="mute">{texte}</p>}
      </div>
      <div className="lien-act"><Link href={href}>{action}</Link></div>
    </article>
  );
}

export function Chargement() { return <p className="mute petit" role="status" style={{ padding: 12 }}>Chargement…</p>; }
export function Erreur({ texte }: { texte: string }) { return <p className="err" role="alert">{texte}</p>; }
