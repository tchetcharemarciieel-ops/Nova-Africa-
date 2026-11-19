"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { findCard, formatPhone, type Card } from "@/lib/cards";

export default function CartePro() {
  const { slug } = useParams<{ slug: string }>();
  const nouveau = useSearchParams().get("nouveau") === "1";
  const [card, setCard] = useState<Card | null | undefined>(undefined);
  const [lien, setLien] = useState("");
  const [copie, setCopie] = useState(false);

  useEffect(() => {
    setCard(findCard(String(slug)) ?? null);
    setLien(`${location.origin}/p/${slug}`);
  }, [slug]);

  if (card === undefined) return <main className="wrap"><p className="note" role="status">Chargement…</p></main>;
  if (card === null) {
    return (
      <main className="wrap">
        <h1>Carte introuvable</h1>
        <p className="lead">Cette carte n&apos;existe pas sur ce téléphone. Dans cette version de test, les cartes ne sont pas encore partagées entre appareils.</p>
        <Link href="/creer" className="btn or">Créer ma carte</Link>
      </main>
    );
  }

  const wa = `https://wa.me/${card.telephone}`;
  const partage = `https://wa.me/?text=${encodeURIComponent(`Voici ma carte pro : ${card.nom}, ${card.metier} à ${card.lieu}. ${lien}`)}`;

  return (
    <main className="wrap">
      {nouveau && <p className="demo">Ta carte est prête. Version de test : elle est gardée sur ce téléphone seulement.</p>}
      <article className="card" aria-label={`Carte pro de ${card.nom}`}>
        <span className="badge">{card.metier}</span>
        <p className="pro-nom">{card.nom}</p>
        <p className="pro-meta">{card.lieu} · {card.langues.join(", ") || "Français"}</p>
        {card.apropos && <p>{card.apropos}</p>}
        <p className="pro-meta">{formatPhone(card.telephone)}</p>
        <div className="row">
          <a className="btn" href={`tel:+${card.telephone}`}>Appeler</a>
          <a className="btn or" href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </div>
      </article>
      <h2>Partager ma carte</h2>
      <div className="row">
        <a className="btn or" href={partage} target="_blank" rel="noopener noreferrer">Partager sur WhatsApp</a>
        <button className="btn clair" type="button" onClick={async () => { try { await navigator.clipboard.writeText(lien); setCopie(true); } catch { setCopie(false); } }}>
          {copie ? "Lien copié" : "Copier le lien"}
        </button>
      </div>
    </main>
  );
}
