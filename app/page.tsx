"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProLigne from "@/components/ProLigne";
import { LIEUX, METIERS, depuis, readBesoins, readCards, waLien, type Besoin, type Card } from "@/lib/data";

export default function Accueil() {
  const router = useRouter();
  const [cartes, setCartes] = useState<Card[]>([]);
  const [besoins, setBesoins] = useState<Besoin[]>([]);
  useEffect(() => { setCartes(readCards().slice(0, 3)); setBesoins(readBesoins().slice(0, 2)); }, []);

  function chercher(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const q = new URLSearchParams();
    if (f.get("m")) q.set("m", String(f.get("m")));
    if (f.get("l")) q.set("l", String(f.get("l")));
    router.push(`/chercher?${q.toString()}`);
  }

  return (
    <main className="wrap">
      <h1>Trouve quelqu&apos;un de confiance.</h1>
      <p className="lead">Des professionnels avec des chantiers confirmés par leurs clients. Tout se fait par WhatsApp.</p>
      <form className="search" onSubmit={chercher}>
        <div><label htmlFor="m">Métier</label><select id="m" name="m" defaultValue=""><option value="">Tous les métiers</option>{METIERS.map(m => <option key={m}>{m}</option>)}</select></div>
        <div><label htmlFor="l">Quartier</label><select id="l" name="l" defaultValue=""><option value="">Tous les quartiers</option>{LIEUX.map(l => <option key={l}>{l}</option>)}</select></div>
        <button className="btn b1" type="submit">Chercher</button>
      </form>
      <div className="chips">{["Plomberie", "Électricité", "Couture et mode", "Mécanique auto"].map(m => <Link key={m} className="chip" href={`/chercher?m=${encodeURIComponent(m)}`}>{m}</Link>)}</div>

      <h2>Besoins du jour</h2>
      {besoins.length === 0 ? <p className="vide">Aucun besoin publié pour l&apos;instant. <Link href="/besoins/nouveau">Publie le tien</Link> : les professionnels te répondent sur WhatsApp.</p>
        : besoins.map((b, i) => (
          <div key={b.id} className={`need${i % 2 ? " alt" : ""}`}>
            <div><b>{b.titre}</b><small>{b.lieu} · {depuis(b.creeLe)}</small></div>
            <a className="go" href={waLien(b.telephone, `Bonjour, je réponds à ton besoin : ${b.titre}`)} target="_blank" rel="noopener noreferrer">Répondre</a>
          </div>))}
      <div className="row" style={{ marginTop: 6 }}>
        <Link href="/besoins/nouveau" className="btn b3">J&apos;ai besoin de…</Link>
        <Link href="/emplois" className="btn b3">Offres d&apos;emploi</Link>
      </div>

      <h2>Professionnels récents</h2>
      {cartes.length === 0 ? <div className="vide">Aucune carte pour l&apos;instant. <Link href="/creer">Crée la première</Link>, ou <Link href="/exemple">regarde un exemple</Link>.</div>
        : cartes.map(c => <ProLigne key={c.slug} c={c} />)}

      <h2>Pourquoi se fier</h2>
      <div className="rev"><b>Des preuves, pas des promesses.</b> Un chantier compte seulement quand le client le confirme.</div>
      <div className="rev"><b>Des niveaux clairs.</b> Profil créé, profil complet, puis identité vérifiée et entreprise déclarée quand ils seront disponibles.</div>
      <div className="rev"><b>Des avis honnêtes.</b> Publiés tels quels, retirés seulement s&apos;ils sont faux ou injurieux, avec une explication.</div>
      <p className="note" style={{ marginTop: 14 }}>Version de test : les cartes, besoins et offres restent pour l&apos;instant sur ton téléphone.</p>
    </main>
  );
}
