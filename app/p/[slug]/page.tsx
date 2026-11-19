"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import CarteVue from "@/components/CarteVue";
import { findCard, type Card } from "@/lib/data";

function Contenu() {
  const { slug } = useParams<{ slug: string }>();
  const nouveau = useSearchParams().get("nouveau") === "1";
  const [card, setCard] = useState<Card | null | undefined>(undefined);
  useEffect(() => { setCard(findCard(String(slug)) ?? null); }, [slug]);

  if (card === undefined) return <main className="wrap"><p className="note" role="status">Chargement…</p></main>;
  if (card === null) return (
    <main className="wrap">
      <h1>Carte introuvable</h1>
      <p className="lead">Cette carte n&apos;existe pas sur ce téléphone. Dans cette version de test, les cartes ne sont pas encore partagées entre appareils.</p>
      <Link href="/creer" className="btn b2">Créer ma carte</Link>
    </main>
  );
  return <CarteVue card={card} nouveau={nouveau} />;
}

export default function CartePro() { return <Suspense fallback={<main className="wrap"><p className="note">Chargement…</p></main>}><Contenu /></Suspense>; }
