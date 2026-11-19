"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "./Avatar";
import { NIVEAUX, formatPhone, maCarte, niveau, stats, waLien, depuis, type Card, type Confirmation } from "@/lib/data";

export default function CarteVue({ card, exemple = false, nouveau = false, confirmationsExemple }: { card: Card; exemple?: boolean; nouveau?: boolean; confirmationsExemple?: Confirmation[] }) {
  const [lien, setLien] = useState("");
  const [qr, setQr] = useState("");
  const [copie, setCopie] = useState(false);
  const [moi, setMoi] = useState(false);
  const [s, setS] = useState({ chantiers: 0, moyenne: 0, avis: [] as Confirmation[] });

  useEffect(() => {
    const url = `${location.origin}/p/${card.slug}`;
    setLien(url);
    setMoi(!exemple && maCarte() === card.slug);
    if (confirmationsExemple) {
      const n = confirmationsExemple.length;
      setS({ chantiers: n, moyenne: Math.round((confirmationsExemple.reduce((a, c) => a + c.note, 0) / n) * 10) / 10, avis: confirmationsExemple });
    } else setS(stats(card.slug));
    import("qrcode").then(q => q.toDataURL(url, { margin: 1, width: 300 })).then(setQr).catch(() => setQr(""));
  }, [card.slug, exemple, confirmationsExemple]);

  const niv = niveau(card);
  const partage = `https://wa.me/?text=${encodeURIComponent(`Voici ma carte pro : ${card.nom}, ${card.metier} à ${card.lieu}. ${lien}`)}`;
  const demande = `https://wa.me/?text=${encodeURIComponent(`Bonjour, peux-tu confirmer le travail que j'ai fait pour toi ? Ça prend une minute : ${lien.replace("/p/", "/confirmer/")}`)}`;

  return (
    <>
      <div className="hd">
        <div className="who"><Avatar nom={card.nom} taille={76} /><div><h1>{card.nom}</h1><small>{card.metier} · {card.lieu} · {card.langues.join(", ") || "Français"}</small></div></div>
      </div>
      <main className="wrap">
        {exemple && <p className="demo" style={{ marginTop: 14 }}><b>Exemple.</b> Cette personne n&apos;existe pas : c&apos;est pour montrer à quoi ressemble une carte.</p>}
        {nouveau && <p className="demo" style={{ marginTop: 14 }}>Ta carte est prête. Version de test : elle reste sur ce téléphone.</p>}
        <section className="lvl" aria-label="Niveau de confiance">
          <b>Niveau {niv} sur 4 · {NIVEAUX[niv - 1].nom}</b>
          <div className="steps" aria-hidden="true">{NIVEAUX.map(n => <i key={n.n} className={n.n <= niv ? "on" : ""} />)}</div>
          <small>Prochains niveaux : identité vérifiée, entreprise déclarée (bientôt).{niv === 1 && " Pour passer au niveau 2, complète « ce que tu sais faire »."}</small>
        </section>
        <div className="stats">
          <div className="st"><b>{s.chantiers}</b><span>chantiers confirmés</span></div>
          <div className="st"><b>{s.chantiers ? s.moyenne.toString().replace(".", ",") : "–"}</b><span>note moyenne</span></div>
          <div className="st"><b>{niv}/4</b><span>niveau</span></div>
        </div>
        {card.apropos && <><h2>À propos</h2><p>{card.apropos}</p></>}
        <h2>Contact</h2>
        <p className="note">{formatPhone(card.telephone)}</p>
        <div className="sticky">
          <a className="btn b1" style={{ flex: 1 }} href={`tel:+${card.telephone}`}>Appeler</a>
          <a className="btn b2" style={{ flex: 1 }} href={waLien(card.telephone, `Bonjour ${card.nom}, je t'ai trouvé sur Réseau pro.`)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </div>
        <h2>Avis de clients</h2>
        {s.avis.length === 0 ? <p className="vide">Pas encore d&apos;avis. Un avis apparaît seulement quand un client confirme un travail.</p>
          : s.avis.slice(0, 5).map(a => (
            <div className="rev" key={a.id}>« {a.avis} »<small><span className="stars" aria-label={`${a.note} sur 5`}>{"★".repeat(a.note)}</span> · {a.prenom || "Un client"} · chantier confirmé · {depuis(a.creeLe)}</small></div>))}
        {!exemple && (
          <>
            <h2>Partager</h2>
            <div className="row">
              <a className="btn b2" href={partage} target="_blank" rel="noopener noreferrer">Partager sur WhatsApp</a>
              <button className="btn b3" type="button" onClick={async () => { try { await navigator.clipboard.writeText(lien); setCopie(true); } catch { setCopie(false); } }}>{copie ? "Lien copié" : "Copier le lien"}</button>
            </div>
            {qr && <div className="qr" style={{ marginTop: 12 }}><img src={qr} alt={`QR code de la carte de ${card.nom}`} /><span className="note">Montre ce code, ou imprime-le pour ton atelier.</span></div>}
            {moi && (
              <>
                <h2>Fais confirmer un travail</h2>
                <p className="note" style={{ marginBottom: 10 }}>Après un chantier, envoie ce lien à ton client. Il confirme en une minute, et ton compteur monte.</p>
                <a className="btn b1" style={{ width: "100%" }} href={demande} target="_blank" rel="noopener noreferrer">Demander une confirmation</a>
              </>
            )}
            {!moi && <p style={{ marginTop: 16 }}><Link className="btn b3" style={{ width: "100%" }} href={`/confirmer/${card.slug}`}>J&apos;ai travaillé avec {card.nom.split(" ")[0]} : confirmer</Link></p>}
          </>
        )}
        <div className="rule"><b>Notre règle sur les avis :</b> publiés tels quels, retirés seulement s&apos;ils sont faux ou injurieux, et nous disons pourquoi. Personne ne peut payer pour les faire disparaître.</div>
      </main>
    </>
  );
}
