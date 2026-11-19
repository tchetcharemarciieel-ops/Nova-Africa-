"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Chargement, Erreur } from "@/components/Blocs";
import { depuis } from "@/lib/constants";
import { api, messageErreur, type Fil } from "@/lib/api";
import { secretExistant } from "@/lib/session";

export default function FilMessages() {
  const { id } = useParams<{ id: string }>();
  const [fil, setFil] = useState<Fil | null | undefined>(undefined);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const fin = useRef<HTMLDivElement>(null);

  const charger = useCallback(async () => {
    const s = secretExistant();
    if (!s) { setFil(null); return; }
    try { setFil(await api.thread(s, String(id))); } catch (e) { setFil(f => f ?? null); setErreur(messageErreur(e)); }
  }, [id]);
  useEffect(() => { charger(); const t = setInterval(charger, 10000); return () => clearInterval(t); }, [charger]);
  const n = fil?.messages.length ?? 0;
  useEffect(() => { fin.current?.scrollIntoView({ block: "end" }); }, [n]);

  if (fil === undefined) return <main className="page"><Chargement /></main>;
  if (fil === null) return <main className="page"><section className="carte"><div className="in"><h1>Conversation</h1>{erreur ? <Erreur texte={erreur} /> : <p className="lead">Cette conversation n&apos;existe pas sur ce téléphone.</p>}<Link className="btn" href="/messages">Mes messages</Link></div></section></main>;

  async function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const texte = String(new FormData(form).get("texte") || "").trim();
    if (!texte || !fil) return;
    setEnvoi(true); setErreur("");
    try { await api.send(secretExistant() || "", fil.autre_id, texte); form.reset(); await charger(); } catch (err) { setErreur(messageErreur(err)); }
    setEnvoi(false);
  }

  return (
    <main className="page" style={{ paddingBottom: 90 }}>
      <section className="carte"><div className="in"><Link href="/messages" className="petit">← Messages</Link><h1 style={{ margin: "4px 0 0", fontSize: 22 }}>{fil.autre_nom}</h1></div></section>
      <div aria-live="polite">
        {fil.messages.map(m => <div key={m.id} className={`bulle ${m.moi ? "moi" : "lui"}`}>{m.texte}<small>{depuis(m.cree_le)}</small></div>)}
      </div>
      <div ref={fin} />
      {erreur && <Erreur texte={erreur} />}
      <div className="composeur"><form onSubmit={envoyer}>
        <label htmlFor="texte" className="sr" style={{ position: "absolute", left: -9999 }}>Ton message</label>
        <textarea id="texte" name="texte" maxLength={1000} placeholder="Écris un message" rows={1} />
        <button className="btn plein" type="submit" disabled={envoi}>Envoyer</button>
      </form></div>
    </main>
  );
}
