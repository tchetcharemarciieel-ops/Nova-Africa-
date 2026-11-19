"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import { Chargement, Erreur } from "@/components/Blocs";
import { depuis } from "@/lib/constants";
import { api, messageErreur, type Conversation } from "@/lib/api";
import { secretExistant } from "@/lib/session";

export default function Messages() {
  const [liste, setListe] = useState<Conversation[] | null>(null);
  const [erreur, setErreur] = useState("");
  useEffect(() => {
    const s = secretExistant();
    if (!s) { setListe([]); return; }
    let vivant = true;
    const charger = () => api.inbox(s).then(r => { if (vivant) setListe(r); }).catch(e => { if (vivant) { setListe(l => l ?? []); setErreur(messageErreur(e)); } });
    charger();
    const t = setInterval(charger, 15000);
    return () => { vivant = false; clearInterval(t); };
  }, []);
  return (
    <main className="page">
      <section className="carte"><div className="in"><h1>Messages</h1></div>
        {liste === null ? <Chargement /> : liste.length === 0 ? <p className="in mute">Aucun message pour l&apos;instant. Écris à un professionnel depuis sa carte, ou réponds à un <Link href="/besoins">besoin</Link>.</p>
          : liste.map(c => (
            <Link key={c.conversation_id} href={`/messages/${c.conversation_id}`} className="ligne">
              <Avatar nom={c.autre_nom} taille={48} />
              <span style={{ minWidth: 0, flex: 1 }}><b>{c.autre_nom}</b><small style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.apercu}</small></span>
              <span style={{ textAlign: "right" }}><small>{depuis(c.derniere)}</small>{c.non_lus > 0 && <span className="tag" style={{ background: "var(--v)", color: "#fff" }}>{c.non_lus}</span>}</span>
            </Link>))}
      </section>
      {erreur && <Erreur texte={erreur} />}
    </main>
  );
}
